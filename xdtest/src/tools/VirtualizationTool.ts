import { Tool } from "../core/types.js";
import { executeShellCommand, commandExists } from "../utils/command.js";

export const listVirtualMachinesTool: Tool = {
  type: "function",
  function: {
    name: "listVirtualMachines",
    description: "Lists virtual machines managed by common hypervisors (VirtualBox, VMware, KVM).",
    parameters: {
      type: "object",
      properties: {
        hypervisor: {
          type: "string",
          description: "Optional: The virtualization software to query (e.g., 'virtualbox', 'vmware', 'kvm').",
          nullable: true,
        },
      },
      required: [],
    },
  },
};

export async function executeListVirtualMachinesTool(args: { hypervisor?: string }): Promise<string> {
  const hv = (args.hypervisor || 'virtualbox').toLowerCase();
  let command: string;
  let cli: string;
  if (hv === 'vmware') {
    command = 'vmrun list';
    cli = 'vmrun';
  } else if (hv === 'kvm' || hv === 'libvirt') {
    command = 'virsh list --all';
    cli = 'virsh';
  } else {
    command = 'VBoxManage list vms';
    cli = 'VBoxManage';
  }
  if (!(await commandExists(cli))) {
    return `${cli} not found. Please install it first.`;
  }
  try {
    const output = await executeShellCommand(command);
    return output.trim() || 'No virtual machines found.';
  } catch (error: any) {
    return `Error listing VMs using ${hv}: ${error.message}`;
  }
}

export const manageVirtualMachineLifecycleTool: Tool = {
  type: "function",
  function: {
    name: "manageVirtualMachineLifecycle",
    description: "Manages the lifecycle of a virtual machine using common hypervisor CLIs.",
    parameters: {
      type: "object",
      properties: {
        vmName: {
          type: "string",
          description: "The name or ID of the virtual machine.",
        },
        operation: {
          type: "string",
          enum: ["create", "delete", "start", "stop", "pause", "resume", "snapshot"],
          description: "The lifecycle operation to perform on the VM.",
        },
        hypervisor: {
          type: "string",
          description: "Optional: The virtualization software managing the VM.",
          nullable: true,
        },
      },
      required: ["vmName", "operation"],
    },
  },
};

export async function executeManageVirtualMachineLifecycleTool(args: { vmName: string; operation: "create" | "delete" | "start" | "stop" | "pause" | "resume" | "snapshot"; hypervisor?: string }): Promise<string> {
  const hv = (args.hypervisor || 'virtualbox').toLowerCase();
  let command: string | null = null;
  let cli: string;
  switch (hv) {
    case 'vmware':
      switch (args.operation) {
        case 'start':
          command = `vmrun start ${args.vmName}`;
          break;
        case 'stop':
          command = `vmrun stop ${args.vmName}`;
          break;
        case 'pause':
          command = `vmrun pause ${args.vmName}`;
          break;
        case 'resume':
          command = `vmrun unpause ${args.vmName}`;
          break;
        case 'delete':
          command = `vmrun deleteVM ${args.vmName}`;
          break;
        case 'snapshot':
          command = `vmrun snapshot ${args.vmName} snapshot-${Date.now()}`;
          break;
      }
      cli = 'vmrun';
      break;
    case 'kvm':
    case 'libvirt':
      switch (args.operation) {
        case 'start':
          command = `virsh start ${args.vmName}`;
          break;
        case 'stop':
          command = `virsh shutdown ${args.vmName}`;
          break;
        case 'pause':
          command = `virsh suspend ${args.vmName}`;
          break;
        case 'resume':
          command = `virsh resume ${args.vmName}`;
          break;
        case 'delete':
          command = `virsh undefine ${args.vmName}`;
          break;
        case 'snapshot':
          command = `virsh snapshot-create-as ${args.vmName} snapshot-${Date.now()}`;
          break;
      }
      cli = 'virsh';
      break;
    default:
      switch (args.operation) {
        case 'start':
          command = `VBoxManage startvm ${args.vmName} --type headless`;
          break;
        case 'stop':
          command = `VBoxManage controlvm ${args.vmName} acpipowerbutton`;
          break;
        case 'pause':
          command = `VBoxManage controlvm ${args.vmName} pause`;
          break;
        case 'resume':
          command = `VBoxManage controlvm ${args.vmName} resume`;
          break;
        case 'delete':
          command = `VBoxManage unregistervm ${args.vmName} --delete`;
          break;
        case 'snapshot':
          command = `VBoxManage snapshot ${args.vmName} take snapshot-${Date.now()}`;
          break;
      }
      cli = 'VBoxManage';
  }

  if (!command) {
    return `Operation '${args.operation}' is not supported by this tool.`;
  }

  if (!(await commandExists(cli))) {
    return `${cli} not found. Please install it first.`;
  }

  try {
    const output = await executeShellCommand(command);
    return output.trim() || 'Command executed';
  } catch (error: any) {
    return `Error executing ${args.operation} on ${args.vmName}: ${error.message}`;
  }
}
