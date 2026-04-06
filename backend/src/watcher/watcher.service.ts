import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import axios from 'axios';
import { EventsGateway } from '../events/events.gateway';
import DiplomaRegistryABI from './abis/DiplomaRegistry.json';

@Injectable()
export class WatcherService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WatcherService.name);
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;
  private isListening = false;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor(
    private configService: ConfigService,
    private eventsGateway: EventsGateway,
  ) {}

  async onModuleInit() {
    await this.startWatching();
  }

  onModuleDestroy() {
    this.stopWatching();
  }

  private async startWatching() {
    const primaryRpc = this.configService.get<string>('POLYGON_RPC_URL');
    const contractAddress = this.configService.get<string>('CONTRACT_ADDRESS');
    const apiBaseUrl = this.configService.get<string>('API_BASE_URL', 'http://localhost:3000');

    if (!primaryRpc || !contractAddress) {
      this.logger.warn('POLYGON_RPC_URL or CONTRACT_ADDRESS not configured. Watcher disabled.');
      return;
    }

    // Fallback RPC URLs for Polygon Amoy
    const rpcUrls = [
      primaryRpc,
      'https://rpc-amoy.polygon.technology',
      'https://polygon-amoy.drpc.org',
      'https://polygon-amoy-bor-rpc.publicnode.com',
    ];

    try {
      // Try each RPC URL until one works
      let connected = false;
      for (const rpcUrl of rpcUrls) {
        try {
          this.logger.log(`Trying RPC: ${rpcUrl}`);
          this.provider = new ethers.JsonRpcProvider(rpcUrl, undefined, {
            staticNetwork: true,
            polling: true,
            pollingInterval: 15000,
          });
          // Force a quick test call
          const network = await Promise.race([
            this.provider.getNetwork(),
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error('RPC timeout')), 5000)),
          ]);
          this.logger.log(`Connected to network: ${network.name} (chainId: ${network.chainId}) via ${rpcUrl}`);
          connected = true;
          break;
        } catch (err) {
          this.logger.warn(`RPC failed: ${rpcUrl} - ${err.message}`);
        }
      }

      if (!connected) {
        throw new Error('All RPC endpoints failed');
      }

      this.contract = new ethers.Contract(contractAddress, DiplomaRegistryABI, this.provider);
      this.logger.log(`Watching contract: ${contractAddress}`);

      await this.attachEventListeners(apiBaseUrl);
      this.isListening = true;
      this.logger.log('Blockchain event watcher started successfully');
    } catch (error) {
      this.logger.error(`Failed to start watcher: ${error.message}`);
      this.scheduleReconnect();
    }
  }

  private async attachEventListeners(apiBaseUrl: string) {
    // DiplomaIssued event
    this.contract.on('DiplomaIssued', async (
      tokenId: bigint,
      recipient: string,
      studentId: string,
      studentName: string,
      degreeTitle: string,
      ipfsCID: string,
      documentHash: string,
      issuedAt: bigint,
      issuedBy: string,
      event: ethers.EventLog,
    ) => {
      this.logger.log(`DiplomaIssued: tokenId=${tokenId}, recipient=${recipient}, studentId=${studentId}`);

      const txHash = event.transactionHash;
      const payload = {
        tokenId: tokenId.toString(),
        recipient,
        studentId,
        studentName,
        degreeTitle,
        ipfsCID,
        documentHash,
        issuedAt: Number(issuedAt),
        issuedBy,
        txHash,
      };

      // Notify the API backend
      try {
        await axios.post(`${apiBaseUrl}/watcher/credential-confirmed`, {
          txHash,
          tokenId: tokenId.toString(),
          studentId,
          documentHash,
        });
        this.logger.log(`API notified for DiplomaIssued tokenId=${tokenId}`);
      } catch (err) {
        this.logger.warn(`Failed to notify API: ${err.message}`);
      }

      // Emit WebSocket events to connected clients
      this.eventsGateway.emitCredentialIssued(studentId, {
        event: 'DiplomaIssued',
        ...payload,
      });

      this.eventsGateway.emitTxConfirmed(
        studentId,
        txHash,
        tokenId.toString(),
      );
    });

    // DiplomaRevoked event
    this.contract.on('DiplomaRevoked', async (
      tokenId: bigint,
      _recipient: string,
      reason: string,
      revokedBy: string,
      _revokedAt: bigint,
      event: ethers.EventLog,
    ) => {
      this.logger.log(`DiplomaRevoked: tokenId=${tokenId}, reason=${reason}`);

      const txHash = event.transactionHash;

      try {
        await axios.post(`${apiBaseUrl}/watcher/credential-revoked`, {
          txHash,
          tokenId: tokenId.toString(),
          reason,
          revokedBy,
        });
      } catch (err) {
        this.logger.warn(`Failed to notify API: ${err.message}`);
      }

      this.eventsGateway.emitCredentialStatusChanged(tokenId.toString(), 'revoked');
    });

    // DiplomaSuspended event
    this.contract.on('DiplomaSuspended', async (
      tokenId: bigint,
      _recipient: string,
      reason: string,
      suspendedBy: string,
      _suspendedAt: bigint,
      event: ethers.EventLog,
    ) => {
      this.logger.log(`DiplomaSuspended: tokenId=${tokenId}, reason=${reason}`);

      const txHash = event.transactionHash;

      try {
        await axios.post(`${apiBaseUrl}/watcher/credential-suspended`, {
          txHash,
          tokenId: tokenId.toString(),
          reason,
          suspendedBy,
        });
      } catch (err) {
        this.logger.warn(`Failed to notify API: ${err.message}`);
      }

      this.eventsGateway.emitCredentialStatusChanged(tokenId.toString(), 'suspended');
    });

    // DiplomaReinstated event
    this.contract.on('DiplomaReinstated', async (
      tokenId: bigint,
      _recipient: string,
      reinstatedBy: string,
      _reinstatedAt: bigint,
      event: ethers.EventLog,
    ) => {
      this.logger.log(`DiplomaReinstated: tokenId=${tokenId}`);

      const txHash = event.transactionHash;

      try {
        await axios.post(`${apiBaseUrl}/watcher/credential-reinstated`, {
          txHash,
          tokenId: tokenId.toString(),
          reinstatedBy,
        });
      } catch (err) {
        this.logger.warn(`Failed to notify API: ${err.message}`);
      }

      this.eventsGateway.emitCredentialStatusChanged(tokenId.toString(), 'confirmed');
    });

    // Handle provider errors for auto-reconnect
    this.provider.on('error', (error) => {
      this.logger.error(`Provider error: ${error.message}`);
      this.scheduleReconnect();
    });
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;

    const delay = 10000; // 10 seconds
    this.logger.log(`Scheduling reconnect in ${delay / 1000}s...`);

    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null;
      this.logger.log('Attempting to reconnect...');
      this.stopWatching();
      await this.startWatching();
    }, delay);
  }

  private stopWatching() {
    if (this.contract) {
      this.contract.removeAllListeners();
    }
    if (this.provider) {
      this.provider.removeAllListeners();
    }
    this.isListening = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.logger.log('Watcher stopped');
  }

  getStatus() {
    return {
      isListening: this.isListening,
      contractAddress: this.configService.get<string>('CONTRACT_ADDRESS'),
      rpcUrl: this.configService.get<string>('POLYGON_RPC_URL'),
    };
  }
}
