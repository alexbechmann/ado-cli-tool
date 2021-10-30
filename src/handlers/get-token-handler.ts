import { AzureDevopsService } from "src/common/azure-devops-service";
import { StorageService } from "src/common/storage-service";
import { container, injectable } from "tsyringe";

@injectable()
export class GetTokenHandler {
  constructor(
    private storageService: StorageService,
    private azureDevopsService: AzureDevopsService
  ) {}
  async logToken({ org }: { org: string }) {
    if (!org) {
      const { azureDevopsOrganization } = this.storageService.get();
      org = azureDevopsOrganization;
    }
    const token = await this.azureDevopsService.getToken({ org });
    console.log(token);
  }
}
