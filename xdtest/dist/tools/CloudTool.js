var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { executeShellCommand, commandExists } from "../utils/command.js";
export const listCloudResourcesTool = {
    type: "function",
    function: {
        name: "listCloudResources",
        description: "Lists cloud resources (VMs, storage buckets, databases) using the provider CLI. Requires the corresponding CLI installed and configured.",
        parameters: {
            type: "object",
            properties: {
                provider: {
                    type: "string",
                    enum: ["aws", "azure", "gcp", "other"],
                    description: "The cloud provider to list resources from.",
                },
                resourceType: {
                    type: "string",
                    description: "Optional: The type of resource to list (e.g., 'vm', 'storage', 'database').",
                    nullable: true,
                },
            },
            required: ["provider"],
        },
    },
};
export function executeListCloudResourcesTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const provider = args.provider.toLowerCase();
        const type = (_a = args.resourceType) === null || _a === void 0 ? void 0 : _a.toLowerCase();
        let command = null;
        if (provider === 'aws') {
            switch (type) {
                case 'vm':
                    command = "aws ec2 describe-instances --query 'Reservations[].Instances[].InstanceId' --output text";
                    break;
                case 'storage':
                    command = 'aws s3 ls';
                    break;
                case 'database':
                    command = "aws rds describe-db-instances --query 'DBInstances[].DBInstanceIdentifier' --output text";
                    break;
                default:
                    command = "aws resourcegroupstaggingapi get-resources --query 'ResourceTagMappingList[].ResourceARN' --output text";
            }
        }
        else if (provider === 'azure') {
            switch (type) {
                case 'vm':
                    command = 'az vm list --query [].name -o tsv';
                    break;
                case 'storage':
                    command = 'az storage account list --query [].name -o tsv';
                    break;
                default:
                    command = 'az resource list --query [].name -o tsv';
            }
        }
        else if (provider === 'gcp') {
            switch (type) {
                case 'vm':
                    command = 'gcloud compute instances list --format=value(name)';
                    break;
                case 'storage':
                    command = 'gsutil ls';
                    break;
                default:
                    command = 'gcloud asset search-all-resources --format=value(name)';
            }
        }
        else {
            return `Unsupported provider: ${args.provider}`;
        }
        const cli = provider === 'aws' ? 'aws' : provider === 'azure' ? 'az' : 'gcloud';
        if (!(yield commandExists(cli))) {
            return `${provider} CLI not found. Please install and configure it first.`;
        }
        try {
            const output = yield executeShellCommand(command);
            return output.trim() || 'No resources found.';
        }
        catch (error) {
            return `Error listing resources: ${error.message}`;
        }
    });
}
export const manageVirtualMachineTool = {
    type: "function",
    function: {
        name: "manageVirtualMachine",
        description: "Manages a virtual machine (start, stop, restart, get status) using the provider CLI.",
        parameters: {
            type: "object",
            properties: {
                provider: {
                    type: "string",
                    enum: ["aws", "azure", "gcp", "other"],
                    description: "The cloud provider where the VM is hosted.",
                },
                vmId: {
                    type: "string",
                    description: "The ID or name of the virtual machine.",
                },
                operation: {
                    type: "string",
                    enum: ["start", "stop", "restart", "status"],
                    description: "The operation to perform on the VM.",
                },
            },
            required: ["provider", "vmId", "operation"],
        },
    },
};
export function executeManageVirtualMachineTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const provider = args.provider.toLowerCase();
        let command = null;
        if (provider === 'aws') {
            switch (args.operation) {
                case 'start':
                    command = `aws ec2 start-instances --instance-ids ${args.vmId}`;
                    break;
                case 'stop':
                    command = `aws ec2 stop-instances --instance-ids ${args.vmId}`;
                    break;
                case 'restart':
                    command = `aws ec2 reboot-instances --instance-ids ${args.vmId}`;
                    break;
                case 'status':
                    command = `aws ec2 describe-instances --instance-ids ${args.vmId} --query 'Reservations[].Instances[].State.Name' --output text`;
                    break;
            }
        }
        else if (provider === 'azure') {
            switch (args.operation) {
                case 'start':
                    command = `az vm start --ids ${args.vmId}`;
                    break;
                case 'stop':
                    command = `az vm deallocate --ids ${args.vmId}`;
                    break;
                case 'restart':
                    command = `az vm restart --ids ${args.vmId}`;
                    break;
                case 'status':
                    command = `az vm get-instance-view --ids ${args.vmId} --query instanceView.statuses[1].displayStatus -o tsv`;
                    break;
            }
        }
        else if (provider === 'gcp') {
            switch (args.operation) {
                case 'start':
                    command = `gcloud compute instances start ${args.vmId}`;
                    break;
                case 'stop':
                    command = `gcloud compute instances stop ${args.vmId}`;
                    break;
                case 'restart':
                    command = `gcloud compute instances reset ${args.vmId}`;
                    break;
                case 'status':
                    command = `gcloud compute instances describe ${args.vmId} --format=value(status)`;
                    break;
            }
        }
        else {
            return `Unsupported provider: ${args.provider}`;
        }
        const cli2 = provider === 'aws' ? 'aws' : provider === 'azure' ? 'az' : 'gcloud';
        if (!(yield commandExists(cli2))) {
            return `${provider} CLI not found. Please install and configure it first.`;
        }
        try {
            const output = yield executeShellCommand(command);
            return output.trim() || 'Command executed';
        }
        catch (error) {
            return `Error managing VM: ${error.message}`;
        }
    });
}
export const manageStorageBucketTool = {
    type: "function",
    function: {
        name: "manageStorageBucket",
        description: "Manages a cloud storage bucket (create, delete, list contents, upload, download) using the provider CLI.",
        parameters: {
            type: "object",
            properties: {
                provider: {
                    type: "string",
                    enum: ["aws", "azure", "gcp", "other"],
                    description: "The cloud provider where the storage bucket is hosted.",
                },
                bucketName: {
                    type: "string",
                    description: "The name of the storage bucket.",
                },
                operation: {
                    type: "string",
                    enum: ["create", "delete", "list", "upload", "download"],
                    description: "The operation to perform on the storage bucket.",
                },
                filePath: {
                    type: "string",
                    description: "Optional: Local file path for upload/download operations.",
                    nullable: true,
                },
                cloudPath: {
                    type: "string",
                    description: "Optional: Path within the bucket for upload/download operations.",
                    nullable: true,
                },
            },
            required: ["provider", "bucketName", "operation"],
        },
    },
};
export function executeManageStorageBucketTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f;
        const provider = args.provider.toLowerCase();
        let command = null;
        if (provider === 'aws') {
            switch (args.operation) {
                case 'create':
                    command = `aws s3 mb s3://${args.bucketName}`;
                    break;
                case 'delete':
                    command = `aws s3 rb s3://${args.bucketName} --force`;
                    break;
                case 'list':
                    command = `aws s3 ls s3://${args.bucketName}`;
                    break;
                case 'upload':
                    if (!args.filePath)
                        return 'filePath required for upload';
                    command = `aws s3 cp ${args.filePath} s3://${args.bucketName}/${(_a = args.cloudPath) !== null && _a !== void 0 ? _a : ''}`.trim();
                    break;
                case 'download':
                    if (!args.filePath)
                        return 'filePath required for download';
                    command = `aws s3 cp s3://${args.bucketName}/${(_b = args.cloudPath) !== null && _b !== void 0 ? _b : ''} ${args.filePath}`.trim();
                    break;
            }
        }
        else if (provider === 'azure') {
            switch (args.operation) {
                case 'create':
                    command = `az storage container create --name ${args.bucketName}`;
                    break;
                case 'delete':
                    command = `az storage container delete --name ${args.bucketName}`;
                    break;
                case 'list':
                    command = `az storage blob list --container-name ${args.bucketName} --query [].name -o tsv`;
                    break;
                case 'upload':
                    if (!args.filePath)
                        return 'filePath required for upload';
                    command = `az storage blob upload --container-name ${args.bucketName} --file ${args.filePath} --name ${(_c = args.cloudPath) !== null && _c !== void 0 ? _c : ''}`.trim();
                    break;
                case 'download':
                    if (!args.filePath)
                        return 'filePath required for download';
                    command = `az storage blob download --container-name ${args.bucketName} --name ${(_d = args.cloudPath) !== null && _d !== void 0 ? _d : ''} --file ${args.filePath}`.trim();
                    break;
            }
        }
        else if (provider === 'gcp') {
            switch (args.operation) {
                case 'create':
                    command = `gsutil mb gs://${args.bucketName}`;
                    break;
                case 'delete':
                    command = `gsutil rm -r gs://${args.bucketName}`;
                    break;
                case 'list':
                    command = `gsutil ls gs://${args.bucketName}`;
                    break;
                case 'upload':
                    if (!args.filePath)
                        return 'filePath required for upload';
                    command = `gsutil cp ${args.filePath} gs://${args.bucketName}/${(_e = args.cloudPath) !== null && _e !== void 0 ? _e : ''}`.trim();
                    break;
                case 'download':
                    if (!args.filePath)
                        return 'filePath required for download';
                    command = `gsutil cp gs://${args.bucketName}/${(_f = args.cloudPath) !== null && _f !== void 0 ? _f : ''} ${args.filePath}`.trim();
                    break;
            }
        }
        else {
            return `Unsupported provider: ${args.provider}`;
        }
        const cli3 = provider === 'aws' ? 'aws' : provider === 'azure' ? 'az' : 'gsutil';
        if (!(yield commandExists(cli3))) {
            return `${provider} CLI not found. Please install and configure it first.`;
        }
        try {
            const output = yield executeShellCommand(command);
            return output.trim() || 'Command executed';
        }
        catch (error) {
            return `Error managing bucket: ${error.message}`;
        }
    });
}
