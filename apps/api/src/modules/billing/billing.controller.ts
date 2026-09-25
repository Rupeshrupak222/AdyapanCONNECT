import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Public } from '../../common/decorators/permissions.decorator';
import { BillingService } from './billing.service';

@ApiTags('Billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Public()
  @Get('plans')
  getPlans() { return this.billingService.getPlans(); }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
  @Get('subscription')
  @RequirePermissions('billing.view')
  getSubscription(@TenantId() tenantId: string) {
    return this.billingService.getSubscription(tenantId);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
  @Get('wallet')
  @RequirePermissions('billing.view')
  getWallet(@TenantId() tenantId: string) { return this.billingService.getWallet(tenantId); }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
  @Get('wallet/transactions')
  @RequirePermissions('billing.view')
  getTransactions(@TenantId() tenantId: string, @Query('page') page = 1, @Query('pageSize') ps = 20) {
    return this.billingService.getWalletTransactions(tenantId, Number(page), Number(ps));
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
  @Get('invoices')
  @RequirePermissions('billing.view')
  getInvoices(@TenantId() tenantId: string, @Query('page') page = 1) {
    return this.billingService.getInvoices(tenantId, Number(page));
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
  @Post('wallet/recharge')
  @RequirePermissions('billing.manage')
  recharge(@TenantId() tenantId: string, @Body() dto: { amount: number }) {
    return this.billingService.addCredits(tenantId, dto.amount, 'Manual recharge');
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
  @Post('subscribe')
  @RequirePermissions('billing.manage')
  subscribe(@TenantId() tenantId: string, @Body() dto: { planId: string }) {
    return this.billingService.subscribe(tenantId, dto.planId);
  }

  // ─── Razorpay ─────────────────────────────────────────────────────────────
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
  @Post('create-order')
  @RequirePermissions('billing.manage')
  createOrder(@TenantId() tenantId: string, @Body() dto: { type: 'plan' | 'wallet'; planId?: string; amount?: number }) {
    return this.billingService.createOrder(tenantId, dto);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
  @Post('verify-payment')
  @RequirePermissions('billing.manage')
  verifyPayment(@TenantId() tenantId: string, @Body() dto: any) {
    return this.billingService.verifyPayment(tenantId, dto);
  }
}
