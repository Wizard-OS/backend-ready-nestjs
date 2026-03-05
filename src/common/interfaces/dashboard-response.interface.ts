export interface DashboardResponse {
  financial: {
    invoiceTotal: string;
    paidTotal: string;
    expenseTotal: string;
    netTotal: string;
    pendingReceivable: string;
  };
  operations: {
    appointments: number;
    reminders: number;
    invoices: number;
    expenses: number;
  };
  breakdown: {
    invoicesByStatus: {
      pending: number;
      partiallyPaid: number;
      paid: number;
      overdue: number;
    };
    remindersByStatus: {
      scheduled: number;
      sent: number;
      failed: number;
    };
  };
  generatedAt: string;
}
