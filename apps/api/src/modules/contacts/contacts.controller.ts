import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { ContactsService } from './contacts.service';
import { CreateContactDto, UpdateContactDto, BulkImportDto } from './contacts.dto';

@ApiTags('Contacts')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  @RequirePermissions('contact.view')
  findAll(@TenantId() tenantId: string, @Query() query: any) {
    return this.contactsService.findAll(tenantId, query);
  }

  @Get(':id')
  @RequirePermissions('contact.view')
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.contactsService.findOne(tenantId, id);
  }

  @Post()
  @RequirePermissions('contact.create')
  create(@TenantId() tenantId: string, @Body() dto: CreateContactDto) {
    return this.contactsService.create(tenantId, dto);
  }

  @Post('import')
  @RequirePermissions('contact.import')
  bulkImport(@TenantId() tenantId: string, @Body() dto: BulkImportDto) {
    return this.contactsService.bulkImport(tenantId, dto.contacts);
  }

  @Put(':id')
  @RequirePermissions('contact.edit')
  update(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: UpdateContactDto) {
    return this.contactsService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @RequirePermissions('contact.delete')
  delete(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.contactsService.delete(tenantId, id);
  }

  @Post(':id/tags')
  @RequirePermissions('contact.edit')
  addTag(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: { name: string }) {
    return this.contactsService.addTag(tenantId, id, dto.name);
  }

  @Delete(':id/tags/:tagName')
  @RequirePermissions('contact.edit')
  removeTag(@TenantId() tenantId: string, @Param('id') id: string, @Param('tagName') tagName: string) {
    return this.contactsService.removeTag(tenantId, id, tagName);
  }
}
