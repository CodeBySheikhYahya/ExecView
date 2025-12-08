//
export enum RechargeProcessStatus {
    FINANCE = "0",
    SUPPORT = "1",
    VERIFICATION = "2",
    OPERATION = "3",
    COMPLETED = "4",
    CANCELLED = "-1",
    FINANCE_CONFIRMED = "5",
    FINANCE_REJECTED = "6",
    VERIFICATIONREJECTED = "16",
    
    OPERATIONREJECTED = "-2",
    BLOCKED = "-3",
  }
  
  export enum RedeemProcessStatus {
    OPERATION = "0",
    VERIFICATION = "1",
    FINANCE = "2",
    FINANCE_PARTIALLY_PAID = "4",
    COMPLETED = "5",
    CANCELLED = "-1",
    OPERATIONFAILED = "7",
    VERIFICATIONFAILED = "8",
    FINANCEFAILED = "9",
    OPERATIONREJECTED = "-2",
    FINANCE_REJECTED = "-10",
    BLOCKED = "-3",
  }
  
  export enum NewAccountProcessStatus {
    PENDING = "0",
    APPROVED = "1",
  }
  // object to map the status to the name
  const statusMap = {
    [RechargeProcessStatus.FINANCE]: "FINANCE",
    [RechargeProcessStatus.SUPPORT]: "SUPPORT",
    [RechargeProcessStatus.VERIFICATION]: "VERIFICATION",
    [RechargeProcessStatus.OPERATION]: "OPERATION",
    [RechargeProcessStatus.COMPLETED]: "COMPLETED",
    [RechargeProcessStatus.CANCELLED]: "CANCELLED",
    [RechargeProcessStatus.OPERATIONREJECTED]: "OPERATION REJECTED",
    [RechargeProcessStatus.BLOCKED]: "BLOCKED",
  };
  // function to return the status name
  export function getStatusName(status: string) {
    return statusMap[status as keyof typeof statusMap] || "-";
  }
  
  export function getRechargeType(process_status: string) {
    if (process_status === RechargeProcessStatus.FINANCE) {
      return "Assignment Pending";
    } else if (process_status === RechargeProcessStatus.SUPPORT) {
      return "Assigned";
    } else if (process_status === RechargeProcessStatus.VERIFICATION) {
      return "Screenshots Submitted";
    } else if (process_status === RechargeProcessStatus.OPERATION) {
      return "Under Operation";
    } else if (process_status === RechargeProcessStatus.COMPLETED) {
      return "Completed";
    } else if (process_status === RechargeProcessStatus.CANCELLED) {
      return "Operation Cancelled";
    } else if (process_status === RechargeProcessStatus.OPERATIONREJECTED) {
      return "Operation Rejected";
    } else if (process_status === RechargeProcessStatus.FINANCE_CONFIRMED) {
      return "SC Confirmation Pending";
    } else if (process_status === RechargeProcessStatus.VERIFICATIONREJECTED) {
      return "Verification Rejected";
    } else if (process_status === RechargeProcessStatus.FINANCE_REJECTED) {
      return "Finance Rejected";
    } else if (process_status === RechargeProcessStatus.BLOCKED) {
      return "Blocked";
    }
    return "Unknown";
  }
  
  export function getRedeemType(process_status: string) {
    if (process_status === RedeemProcessStatus.OPERATION) {
      return "Pending";
    } else if (process_status === RedeemProcessStatus.VERIFICATION) {
      return "Under Verification";
    } else if (process_status === RedeemProcessStatus.FINANCE) {
      return "Queued";
    } else if (process_status === RedeemProcessStatus.FINANCE_PARTIALLY_PAID) {
      return "Partially Paid";
    } else if (process_status === RedeemProcessStatus.COMPLETED) {
      return "Completed";
    } else if (process_status === RedeemProcessStatus.CANCELLED) {
      return "Cancelled";
    } else if (process_status === RedeemProcessStatus.OPERATIONFAILED) {
      return "Operation Failed";
    } else if (process_status === RedeemProcessStatus.VERIFICATIONFAILED) {
      return "Verification Failed";
    } else if (process_status === RedeemProcessStatus.FINANCEFAILED) {
      return "Finance Failed";
    } else if (process_status === RedeemProcessStatus.OPERATIONREJECTED) {
      return "Operation Rejected";
    } else if (process_status === RedeemProcessStatus.FINANCE_REJECTED) {
      return "Finance Rejected";
    } else if (process_status === RedeemProcessStatus.BLOCKED) {
      return "Blocked";
    }
    return "Unknown";
  }
  
  export enum TransferRequestStatus {
    PENDING = "1",
    COMPLETED = "2",
    CANCELLED = "3",
  }
  
  export const getTransferStatus = {
    [TransferRequestStatus.PENDING]: "Pending",
    [TransferRequestStatus.COMPLETED]: "Completed",
    [TransferRequestStatus.CANCELLED]: "Cancelled",
  };
  
  export enum ResetPasswordRequestStatus {
    PENDING = "0",
    COMPLETED = "1",
    CANCELLED = "-1",
  }
  
  export const getResetPasswordStatus = {
    [ResetPasswordRequestStatus.PENDING]: "Pending",
    [ResetPasswordRequestStatus.COMPLETED]: "Completed",
    [ResetPasswordRequestStatus.CANCELLED]: "Cancelled",
  };
  
  // PENDING(UNDER VERIFICATION)
  // PENDING(VERIFIED)
  // PENDING()
  
  export const TEN_SECONDS = false;
  export const TWO_SECONDS = 5000;
  
  
  // useeffect time
  
  
  export const TEN_SECONDS_DELAY = 60000
  
  // Redeem Limit Constants
  export const REDEEM_LIMITS = {
    GLOBAL_DAILY_LIMIT: 2000.00,  // Total across all games
    PER_GAME_DAILY_LIMIT: 500.00,  // Per game limit
  } as const;
  
  // Rolling window time in milliseconds
  // For testing: 5 minutes = 5 * 60 * 1000
  // For production: 24 hours = 24 * 60 * 60 * 1000
  export const REDEEM_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000; // 5 minutes for testing
  
  // Statuses that count against limit (exclude rejected/cancelled/blocked)
  export const COUNTABLE_REDEEM_STATUSES = [
    RedeemProcessStatus.OPERATION,
    RedeemProcessStatus.VERIFICATION,
    RedeemProcessStatus.FINANCE,
    RedeemProcessStatus.FINANCE_PARTIALLY_PAID,
    RedeemProcessStatus.COMPLETED,
  ] as const;