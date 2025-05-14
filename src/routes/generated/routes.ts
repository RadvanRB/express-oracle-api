/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import type { TsoaRoute } from '@tsoa/runtime';
import {  fetchMiddlewares, ExpressTemplateService } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { DocumentationController } from './../../controllers/DocumentationController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ProductFeedController } from './../../modules/interfaces/productfeeds/controllers/ProductFeedController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { SupplierController } from './../../modules/etlcore/suppliers/controllers/SupplierController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ProductController } from './../../modules/etlcore/products/controllers/ProductController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ProductImageController } from './../../modules/etlcore/productimages/controllers/ProductImageController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { CategoryController } from './../../modules/etlcore/categories/controllers/CategoryController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { UserController } from './../../modules/app/users/controllers/UserController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { UserRoleController } from './../../modules/app/userrole/controllers/UserRoleController';
import { expressAuthentication } from './../../middlewares/authentication';
// @ts-ignore - no great way to install types from subpackage
import type { Request as ExRequest, Response as ExResponse, RequestHandler, Router } from 'express';

const expressAuthenticationRecasted = expressAuthentication as (req: ExRequest, securityName: string, scopes?: string[], res?: ExResponse) => Promise<any>;


// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "Record_string._description-string--example-string__": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{},"additionalProperties":{"dataType":"nestedObjectLiteral","nestedProperties":{"example":{"dataType":"string","required":true},"description":{"dataType":"string","required":true}}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Record_string.string_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{},"additionalProperties":{"dataType":"string"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ProductFeedDto": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "name": {"dataType":"string","required":true},
            "description": {"dataType":"string"},
            "sourceSystem": {"dataType":"string","required":true},
            "targetSystem": {"dataType":"string","required":true},
            "format": {"dataType":"string","required":true},
            "url": {"dataType":"string","required":true},
            "isActive": {"dataType":"boolean","required":true},
            "refreshInterval": {"dataType":"double"},
            "transformationScript": {"dataType":"string"},
            "filterCriteria": {"dataType":"string"},
            "productIds": {"dataType":"array","array":{"dataType":"double"}},
            "productCount": {"dataType":"double"},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateProductFeedDto": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
            "description": {"dataType":"string"},
            "sourceSystem": {"dataType":"string","required":true},
            "targetSystem": {"dataType":"string","required":true},
            "format": {"dataType":"string","required":true},
            "url": {"dataType":"string","required":true},
            "isActive": {"dataType":"boolean"},
            "refreshInterval": {"dataType":"double"},
            "transformationScript": {"dataType":"string"},
            "filterCriteria": {"dataType":"string"},
            "productIds": {"dataType":"array","array":{"dataType":"double"}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateProductFeedDto": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string"},
            "description": {"dataType":"string"},
            "sourceSystem": {"dataType":"string"},
            "targetSystem": {"dataType":"string"},
            "format": {"dataType":"string"},
            "url": {"dataType":"string"},
            "isActive": {"dataType":"boolean"},
            "refreshInterval": {"dataType":"double"},
            "transformationScript": {"dataType":"string"},
            "filterCriteria": {"dataType":"string"},
            "productIds": {"dataType":"array","array":{"dataType":"double"}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SupplierDto": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "name": {"dataType":"string","required":true},
            "contactName": {"dataType":"string"},
            "contactEmail": {"dataType":"string"},
            "contactPhone": {"dataType":"string"},
            "address": {"dataType":"string"},
            "city": {"dataType":"string"},
            "postalCode": {"dataType":"string"},
            "country": {"dataType":"string"},
            "isActive": {"dataType":"boolean","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateSupplierDto": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
            "contactName": {"dataType":"string"},
            "contactEmail": {"dataType":"string"},
            "contactPhone": {"dataType":"string"},
            "address": {"dataType":"string"},
            "city": {"dataType":"string"},
            "postalCode": {"dataType":"string"},
            "country": {"dataType":"string"},
            "isActive": {"dataType":"boolean"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateSupplierDto": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string"},
            "contactName": {"dataType":"string"},
            "contactEmail": {"dataType":"string"},
            "contactPhone": {"dataType":"string"},
            "address": {"dataType":"string"},
            "city": {"dataType":"string"},
            "postalCode": {"dataType":"string"},
            "country": {"dataType":"string"},
            "isActive": {"dataType":"boolean"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ProductDto": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "name": {"dataType":"string","required":true},
            "description": {"dataType":"string"},
            "category": {"dataType":"string","required":true},
            "subCategory": {"dataType":"string"},
            "price": {"dataType":"double","required":true},
            "stock": {"dataType":"double","required":true},
            "width": {"dataType":"double"},
            "height": {"dataType":"double"},
            "depth": {"dataType":"double"},
            "weight": {"dataType":"double"},
            "color": {"dataType":"string"},
            "manufacturer": {"dataType":"string"},
            "sku": {"dataType":"string"},
            "isActive": {"dataType":"boolean","required":true},
            "manufactureDate": {"dataType":"datetime"},
            "expiryDate": {"dataType":"datetime"},
            "stockedDate": {"dataType":"datetime"},
            "lastSoldDate": {"dataType":"datetime"},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ProductImageDto": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "productId": {"dataType":"double","required":true},
            "url": {"dataType":"string","required":true},
            "title": {"dataType":"string"},
            "altText": {"dataType":"string"},
            "sortOrder": {"dataType":"double","required":true},
            "width": {"dataType":"double"},
            "height": {"dataType":"double"},
            "imageType": {"dataType":"string"},
            "isMain": {"dataType":"boolean","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateProductImageDto": {
        "dataType": "refObject",
        "properties": {
            "productId": {"dataType":"double","required":true},
            "url": {"dataType":"string","required":true},
            "title": {"dataType":"string"},
            "altText": {"dataType":"string"},
            "sortOrder": {"dataType":"double"},
            "width": {"dataType":"double"},
            "height": {"dataType":"double"},
            "imageType": {"dataType":"string"},
            "isMain": {"dataType":"boolean"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateProductImageDto": {
        "dataType": "refObject",
        "properties": {
            "productId": {"dataType":"double"},
            "url": {"dataType":"string"},
            "title": {"dataType":"string"},
            "altText": {"dataType":"string"},
            "sortOrder": {"dataType":"double"},
            "width": {"dataType":"double"},
            "height": {"dataType":"double"},
            "imageType": {"dataType":"string"},
            "isMain": {"dataType":"boolean"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DbErrorResponse": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"enum","enums":[false],"required":true},
            "message": {"dataType":"string","required":true},
            "error": {"dataType":"string","required":true},
            "recovered": {"dataType":"boolean","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CategoryDto": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "name": {"dataType":"string","required":true},
            "code": {"dataType":"string","required":true},
            "description": {"dataType":"string"},
            "parentId": {"dataType":"double"},
            "level": {"dataType":"double","required":true},
            "displayOrder": {"dataType":"double","required":true},
            "isActive": {"dataType":"boolean","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SourceMetadata": {
        "dataType": "refObject",
        "properties": {
            "description": {"dataType":"string"},
            "schemaName": {"dataType":"string"},
            "tableName": {"dataType":"string"},
            "system": {"dataType":"string"},
            "owner": {"dataType":"string"},
        },
        "additionalProperties": {"dataType":"any"},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ColumnMetadata": {
        "dataType": "refObject",
        "properties": {
            "description": {"dataType":"string"},
            "displayName": {"dataType":"string"},
            "dataType": {"dataType":"string"},
            "format": {"dataType":"string"},
            "validationRules": {"dataType":"array","array":{"dataType":"string"}},
            "foreignKey": {"dataType":"nestedObjectLiteral","nestedProperties":{"column":{"dataType":"string","required":true},"table":{"dataType":"string","required":true}}},
        },
        "additionalProperties": {"dataType":"any"},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Record_string.ColumnMetadata_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{},"additionalProperties":{"ref":"ColumnMetadata"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EntityMetadata": {
        "dataType": "refObject",
        "properties": {
            "sourceInfo": {"ref":"SourceMetadata"},
            "columnInfo": {"ref":"Record_string.ColumnMetadata_"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateCategoryDto": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
            "code": {"dataType":"string","required":true},
            "description": {"dataType":"string"},
            "parentId": {"dataType":"double"},
            "level": {"dataType":"double"},
            "displayOrder": {"dataType":"double"},
            "isActive": {"dataType":"boolean"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateCategoryDto": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string"},
            "code": {"dataType":"string"},
            "description": {"dataType":"string"},
            "parentId": {"dataType":"double"},
            "level": {"dataType":"double"},
            "displayOrder": {"dataType":"double"},
            "isActive": {"dataType":"boolean"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UserDto": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "firstName": {"dataType":"string","required":true},
            "lastName": {"dataType":"string","required":true},
            "email": {"dataType":"string","required":true},
            "phone": {"dataType":"string"},
            "address": {"dataType":"string"},
            "isActive": {"dataType":"boolean","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateUserDto": {
        "dataType": "refObject",
        "properties": {
            "firstName": {"dataType":"string","required":true},
            "lastName": {"dataType":"string","required":true},
            "email": {"dataType":"string","required":true},
            "password": {"dataType":"string","required":true,"validators":{"minLength":{"value":8}}},
            "phone": {"dataType":"string","validators":{"pattern":{"value":"^[+]?[(]?[0-9]{3}[)]?[-\\s.]?[0-9]{3}[-\\s.]?[0-9]{4,6}$"}}},
            "address": {"dataType":"string"},
            "isActive": {"dataType":"boolean","default":true,"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateUserDto": {
        "dataType": "refObject",
        "properties": {
            "firstName": {"dataType":"string"},
            "lastName": {"dataType":"string"},
            "email": {"dataType":"string"},
            "phone": {"dataType":"string"},
            "address": {"dataType":"string"},
            "isActive": {"dataType":"boolean"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "User": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "firstName": {"dataType":"string","required":true},
            "lastName": {"dataType":"string","required":true},
            "email": {"dataType":"string","required":true},
            "password": {"dataType":"string","required":true},
            "isActive": {"dataType":"boolean","required":true},
            "phone": {"dataType":"string"},
            "address": {"dataType":"string"},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EntityType": {
        "dataType": "refEnum",
        "enums": ["MODEL","PROCEDURE"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "OperationType": {
        "dataType": "refEnum",
        "enums": ["SELECT","INSERT","UPDATE","DELETE","EXECUTE"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Role": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "code": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "description": {"dataType":"string"},
            "isSystem": {"dataType":"boolean","required":true},
            "isActive": {"dataType":"boolean","required":true},
            "permissions": {"dataType":"array","array":{"dataType":"refObject","ref":"Permission"}},
            "users": {"dataType":"array","array":{"dataType":"refObject","ref":"User"}},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Permission": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "entityName": {"dataType":"string","required":true},
            "entityType": {"ref":"EntityType","required":true},
            "operation": {"ref":"OperationType","required":true},
            "description": {"dataType":"string"},
            "condition": {"dataType":"string"},
            "roles": {"dataType":"array","array":{"dataType":"refObject","ref":"Role"}},
            "isActive": {"dataType":"boolean","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UserRole": {
        "dataType": "refObject",
        "properties": {
            "userId": {"dataType":"double","required":true},
            "roleId": {"dataType":"double","required":true},
            "roleName": {"dataType":"string","required":true},
            "isActive": {"dataType":"double","required":true},
            "description": {"dataType":"string"},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "user": {"ref":"User","required":true},
            "role": {"ref":"Role","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AssignRoleRequest": {
        "dataType": "refObject",
        "properties": {
            "userId": {"dataType":"double","required":true},
            "roleId": {"dataType":"double","required":true},
            "roleName": {"dataType":"string","required":true},
            "description": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateRoleRequest": {
        "dataType": "refObject",
        "properties": {
            "roleName": {"dataType":"string"},
            "description": {"dataType":"string"},
            "isActive": {"dataType":"double"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const templateService = new ExpressTemplateService(models, {"noImplicitAdditionalProperties":"throw-on-extras","bodyCoercion":true});

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa




export function RegisterRoutes(app: Router) {

    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################


    
        const argsDocumentationController_getFilterOperators: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/documentation/filter-operators',
            ...(fetchMiddlewares<RequestHandler>(DocumentationController)),
            ...(fetchMiddlewares<RequestHandler>(DocumentationController.prototype.getFilterOperators)),

            async function DocumentationController_getFilterOperators(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDocumentationController_getFilterOperators, request, response });

                const controller = new DocumentationController();

              await templateService.apiHandler({
                methodName: 'getFilterOperators',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsDocumentationController_getAdvancedFilterExamples: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/documentation/advanced-filter-examples',
            ...(fetchMiddlewares<RequestHandler>(DocumentationController)),
            ...(fetchMiddlewares<RequestHandler>(DocumentationController.prototype.getAdvancedFilterExamples)),

            async function DocumentationController_getAdvancedFilterExamples(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDocumentationController_getAdvancedFilterExamples, request, response });

                const controller = new DocumentationController();

              await templateService.apiHandler({
                methodName: 'getAdvancedFilterExamples',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsDocumentationController_getPaginationAndSortInfo: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/documentation/pagination-and-sort',
            ...(fetchMiddlewares<RequestHandler>(DocumentationController)),
            ...(fetchMiddlewares<RequestHandler>(DocumentationController.prototype.getPaginationAndSortInfo)),

            async function DocumentationController_getPaginationAndSortInfo(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDocumentationController_getPaginationAndSortInfo, request, response });

                const controller = new DocumentationController();

              await templateService.apiHandler({
                methodName: 'getPaginationAndSortInfo',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsDocumentationController_getFilterUrlExamples: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/documentation/filter-url-examples',
            ...(fetchMiddlewares<RequestHandler>(DocumentationController)),
            ...(fetchMiddlewares<RequestHandler>(DocumentationController.prototype.getFilterUrlExamples)),

            async function DocumentationController_getFilterUrlExamples(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDocumentationController_getFilterUrlExamples, request, response });

                const controller = new DocumentationController();

              await templateService.apiHandler({
                methodName: 'getFilterUrlExamples',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsProductFeedController_getProductFeeds: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                isActive: {"in":"query","name":"isActive","dataType":"boolean"},
                format: {"in":"query","name":"format","dataType":"string"},
        };
        app.get('/api/productfeeds',
            ...(fetchMiddlewares<RequestHandler>(ProductFeedController)),
            ...(fetchMiddlewares<RequestHandler>(ProductFeedController.prototype.getProductFeeds)),

            async function ProductFeedController_getProductFeeds(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsProductFeedController_getProductFeeds, request, response });

                const controller = new ProductFeedController();

              await templateService.apiHandler({
                methodName: 'getProductFeeds',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsProductFeedController_getProductFeed: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
        };
        app.get('/api/productfeeds/:id',
            ...(fetchMiddlewares<RequestHandler>(ProductFeedController)),
            ...(fetchMiddlewares<RequestHandler>(ProductFeedController.prototype.getProductFeed)),

            async function ProductFeedController_getProductFeed(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsProductFeedController_getProductFeed, request, response });

                const controller = new ProductFeedController();

              await templateService.apiHandler({
                methodName: 'getProductFeed',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsProductFeedController_createProductFeed: Record<string, TsoaRoute.ParameterSchema> = {
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"CreateProductFeedDto"},
        };
        app.post('/api/productfeeds',
            ...(fetchMiddlewares<RequestHandler>(ProductFeedController)),
            ...(fetchMiddlewares<RequestHandler>(ProductFeedController.prototype.createProductFeed)),

            async function ProductFeedController_createProductFeed(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsProductFeedController_createProductFeed, request, response });

                const controller = new ProductFeedController();

              await templateService.apiHandler({
                methodName: 'createProductFeed',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsProductFeedController_updateProductFeed: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"UpdateProductFeedDto"},
        };
        app.put('/api/productfeeds/:id',
            ...(fetchMiddlewares<RequestHandler>(ProductFeedController)),
            ...(fetchMiddlewares<RequestHandler>(ProductFeedController.prototype.updateProductFeed)),

            async function ProductFeedController_updateProductFeed(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsProductFeedController_updateProductFeed, request, response });

                const controller = new ProductFeedController();

              await templateService.apiHandler({
                methodName: 'updateProductFeed',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsProductFeedController_deleteProductFeed: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
        };
        app.delete('/api/productfeeds/:id',
            ...(fetchMiddlewares<RequestHandler>(ProductFeedController)),
            ...(fetchMiddlewares<RequestHandler>(ProductFeedController.prototype.deleteProductFeed)),

            async function ProductFeedController_deleteProductFeed(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsProductFeedController_deleteProductFeed, request, response });

                const controller = new ProductFeedController();

              await templateService.apiHandler({
                methodName: 'deleteProductFeed',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsProductFeedController_getProductsForFeed: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
        };
        app.get('/api/productfeeds/:id/products',
            ...(fetchMiddlewares<RequestHandler>(ProductFeedController)),
            ...(fetchMiddlewares<RequestHandler>(ProductFeedController.prototype.getProductsForFeed)),

            async function ProductFeedController_getProductsForFeed(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsProductFeedController_getProductsForFeed, request, response });

                const controller = new ProductFeedController();

              await templateService.apiHandler({
                methodName: 'getProductsForFeed',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsProductFeedController_addProductsToFeed: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
                requestBody: {"in":"body","name":"requestBody","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"productIds":{"dataType":"array","array":{"dataType":"double"},"required":true}}},
        };
        app.post('/api/productfeeds/:id/products',
            ...(fetchMiddlewares<RequestHandler>(ProductFeedController)),
            ...(fetchMiddlewares<RequestHandler>(ProductFeedController.prototype.addProductsToFeed)),

            async function ProductFeedController_addProductsToFeed(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsProductFeedController_addProductsToFeed, request, response });

                const controller = new ProductFeedController();

              await templateService.apiHandler({
                methodName: 'addProductsToFeed',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsProductFeedController_updateProductsInFeed: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
                requestBody: {"in":"body","name":"requestBody","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"productIds":{"dataType":"array","array":{"dataType":"double"},"required":true}}},
        };
        app.put('/api/productfeeds/:id/products',
            ...(fetchMiddlewares<RequestHandler>(ProductFeedController)),
            ...(fetchMiddlewares<RequestHandler>(ProductFeedController.prototype.updateProductsInFeed)),

            async function ProductFeedController_updateProductsInFeed(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsProductFeedController_updateProductsInFeed, request, response });

                const controller = new ProductFeedController();

              await templateService.apiHandler({
                methodName: 'updateProductsInFeed',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsProductFeedController_removeProductsFromFeed: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
                requestBody: {"in":"body","name":"requestBody","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"productIds":{"dataType":"array","array":{"dataType":"double"},"required":true}}},
        };
        app.delete('/api/productfeeds/:id/products',
            ...(fetchMiddlewares<RequestHandler>(ProductFeedController)),
            ...(fetchMiddlewares<RequestHandler>(ProductFeedController.prototype.removeProductsFromFeed)),

            async function ProductFeedController_removeProductsFromFeed(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsProductFeedController_removeProductsFromFeed, request, response });

                const controller = new ProductFeedController();

              await templateService.apiHandler({
                methodName: 'removeProductsFromFeed',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsProductFeedController_seedProductFeeds: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.post('/api/productfeeds/seed',
            ...(fetchMiddlewares<RequestHandler>(ProductFeedController)),
            ...(fetchMiddlewares<RequestHandler>(ProductFeedController.prototype.seedProductFeeds)),

            async function ProductFeedController_seedProductFeeds(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsProductFeedController_seedProductFeeds, request, response });

                const controller = new ProductFeedController();

              await templateService.apiHandler({
                methodName: 'seedProductFeeds',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSupplierController_getSuppliers: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/suppliers',
            ...(fetchMiddlewares<RequestHandler>(SupplierController)),
            ...(fetchMiddlewares<RequestHandler>(SupplierController.prototype.getSuppliers)),

            async function SupplierController_getSuppliers(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSupplierController_getSuppliers, request, response });

                const controller = new SupplierController();

              await templateService.apiHandler({
                methodName: 'getSuppliers',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSupplierController_getSupplier: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
        };
        app.get('/suppliers/:id',
            ...(fetchMiddlewares<RequestHandler>(SupplierController)),
            ...(fetchMiddlewares<RequestHandler>(SupplierController.prototype.getSupplier)),

            async function SupplierController_getSupplier(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSupplierController_getSupplier, request, response });

                const controller = new SupplierController();

              await templateService.apiHandler({
                methodName: 'getSupplier',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSupplierController_createSupplier: Record<string, TsoaRoute.ParameterSchema> = {
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"CreateSupplierDto"},
        };
        app.post('/suppliers',
            ...(fetchMiddlewares<RequestHandler>(SupplierController)),
            ...(fetchMiddlewares<RequestHandler>(SupplierController.prototype.createSupplier)),

            async function SupplierController_createSupplier(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSupplierController_createSupplier, request, response });

                const controller = new SupplierController();

              await templateService.apiHandler({
                methodName: 'createSupplier',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSupplierController_updateSupplier: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"UpdateSupplierDto"},
        };
        app.put('/suppliers/:id',
            ...(fetchMiddlewares<RequestHandler>(SupplierController)),
            ...(fetchMiddlewares<RequestHandler>(SupplierController.prototype.updateSupplier)),

            async function SupplierController_updateSupplier(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSupplierController_updateSupplier, request, response });

                const controller = new SupplierController();

              await templateService.apiHandler({
                methodName: 'updateSupplier',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSupplierController_deleteSupplier: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
        };
        app.delete('/suppliers/:id',
            ...(fetchMiddlewares<RequestHandler>(SupplierController)),
            ...(fetchMiddlewares<RequestHandler>(SupplierController.prototype.deleteSupplier)),

            async function SupplierController_deleteSupplier(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSupplierController_deleteSupplier, request, response });

                const controller = new SupplierController();

              await templateService.apiHandler({
                methodName: 'deleteSupplier',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSupplierController_seedTestData: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.post('/suppliers/seed',
            ...(fetchMiddlewares<RequestHandler>(SupplierController)),
            ...(fetchMiddlewares<RequestHandler>(SupplierController.prototype.seedTestData)),

            async function SupplierController_seedTestData(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSupplierController_seedTestData, request, response });

                const controller = new SupplierController();

              await templateService.apiHandler({
                methodName: 'seedTestData',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSupplierController_getActiveSuppliers: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/suppliers/active',
            ...(fetchMiddlewares<RequestHandler>(SupplierController)),
            ...(fetchMiddlewares<RequestHandler>(SupplierController.prototype.getActiveSuppliers)),

            async function SupplierController_getActiveSuppliers(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSupplierController_getActiveSuppliers, request, response });

                const controller = new SupplierController();

              await templateService.apiHandler({
                methodName: 'getActiveSuppliers',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSupplierController_getSuppliersByCountry: Record<string, TsoaRoute.ParameterSchema> = {
                country: {"in":"path","name":"country","required":true,"dataType":"string"},
        };
        app.get('/suppliers/country/:country',
            ...(fetchMiddlewares<RequestHandler>(SupplierController)),
            ...(fetchMiddlewares<RequestHandler>(SupplierController.prototype.getSuppliersByCountry)),

            async function SupplierController_getSuppliersByCountry(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSupplierController_getSuppliersByCountry, request, response });

                const controller = new SupplierController();

              await templateService.apiHandler({
                methodName: 'getSuppliersByCountry',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsProductController_getProducts: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/products',
            ...(fetchMiddlewares<RequestHandler>(ProductController)),
            ...(fetchMiddlewares<RequestHandler>(ProductController.prototype.getProducts)),

            async function ProductController_getProducts(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsProductController_getProducts, request, response });

                const controller = new ProductController();

              await templateService.apiHandler({
                methodName: 'getProducts',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsProductController_seedTestData: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.post('/products/seed',
            ...(fetchMiddlewares<RequestHandler>(ProductController)),
            ...(fetchMiddlewares<RequestHandler>(ProductController.prototype.seedTestData)),

            async function ProductController_seedTestData(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsProductController_seedTestData, request, response });

                const controller = new ProductController();

              await templateService.apiHandler({
                methodName: 'seedTestData',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsProductController_advancedFilter: Record<string, TsoaRoute.ParameterSchema> = {
                filterOptions: {"in":"body","name":"filterOptions","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"sort":{"dataType":"array","array":{"dataType":"nestedObjectLiteral","nestedProperties":{"direction":{"dataType":"string","required":true},"field":{"dataType":"string","required":true}}}},"limit":{"dataType":"double"},"page":{"dataType":"double"},"isActive":{"dataType":"boolean"},"inStock":{"dataType":"boolean"},"searchText":{"dataType":"string"},"dimensions":{"dataType":"nestedObjectLiteral","nestedProperties":{"maxWeight":{"dataType":"double"},"maxDepth":{"dataType":"double"},"maxHeight":{"dataType":"double"},"maxWidth":{"dataType":"double"}}},"dateFilters":{"dataType":"nestedObjectLiteral","nestedProperties":{"stockedDateBefore":{"dataType":"string"},"stockedDateAfter":{"dataType":"string"},"expiryDateBefore":{"dataType":"string"},"expiryDateAfter":{"dataType":"string"},"manufacturedBefore":{"dataType":"string"},"manufacturedAfter":{"dataType":"string"}}},"manufacturers":{"dataType":"array","array":{"dataType":"string"}},"categories":{"dataType":"array","array":{"dataType":"string"}},"priceRange":{"dataType":"nestedObjectLiteral","nestedProperties":{"max":{"dataType":"double"},"min":{"dataType":"double"}}}}},
        };
        app.post('/products/advanced-filter',
            ...(fetchMiddlewares<RequestHandler>(ProductController)),
            ...(fetchMiddlewares<RequestHandler>(ProductController.prototype.advancedFilter)),

            async function ProductController_advancedFilter(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsProductController_advancedFilter, request, response });

                const controller = new ProductController();

              await templateService.apiHandler({
                methodName: 'advancedFilter',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsProductImageController_getProductImages: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/product-images',
            ...(fetchMiddlewares<RequestHandler>(ProductImageController)),
            ...(fetchMiddlewares<RequestHandler>(ProductImageController.prototype.getProductImages)),

            async function ProductImageController_getProductImages(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsProductImageController_getProductImages, request, response });

                const controller = new ProductImageController();

              await templateService.apiHandler({
                methodName: 'getProductImages',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsProductImageController_getProductImage: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
        };
        app.get('/product-images/:id',
            ...(fetchMiddlewares<RequestHandler>(ProductImageController)),
            ...(fetchMiddlewares<RequestHandler>(ProductImageController.prototype.getProductImage)),

            async function ProductImageController_getProductImage(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsProductImageController_getProductImage, request, response });

                const controller = new ProductImageController();

              await templateService.apiHandler({
                methodName: 'getProductImage',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsProductImageController_createProductImage: Record<string, TsoaRoute.ParameterSchema> = {
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"CreateProductImageDto"},
        };
        app.post('/product-images',
            ...(fetchMiddlewares<RequestHandler>(ProductImageController)),
            ...(fetchMiddlewares<RequestHandler>(ProductImageController.prototype.createProductImage)),

            async function ProductImageController_createProductImage(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsProductImageController_createProductImage, request, response });

                const controller = new ProductImageController();

              await templateService.apiHandler({
                methodName: 'createProductImage',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsProductImageController_updateProductImage: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"UpdateProductImageDto"},
        };
        app.put('/product-images/:id',
            ...(fetchMiddlewares<RequestHandler>(ProductImageController)),
            ...(fetchMiddlewares<RequestHandler>(ProductImageController.prototype.updateProductImage)),

            async function ProductImageController_updateProductImage(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsProductImageController_updateProductImage, request, response });

                const controller = new ProductImageController();

              await templateService.apiHandler({
                methodName: 'updateProductImage',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsProductImageController_deleteProductImage: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
        };
        app.delete('/product-images/:id',
            ...(fetchMiddlewares<RequestHandler>(ProductImageController)),
            ...(fetchMiddlewares<RequestHandler>(ProductImageController.prototype.deleteProductImage)),

            async function ProductImageController_deleteProductImage(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsProductImageController_deleteProductImage, request, response });

                const controller = new ProductImageController();

              await templateService.apiHandler({
                methodName: 'deleteProductImage',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsProductImageController_getProductImagesByProductId: Record<string, TsoaRoute.ParameterSchema> = {
                productId: {"in":"path","name":"productId","required":true,"dataType":"double"},
        };
        app.get('/product-images/product/:productId',
            ...(fetchMiddlewares<RequestHandler>(ProductImageController)),
            ...(fetchMiddlewares<RequestHandler>(ProductImageController.prototype.getProductImagesByProductId)),

            async function ProductImageController_getProductImagesByProductId(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsProductImageController_getProductImagesByProductId, request, response });

                const controller = new ProductImageController();

              await templateService.apiHandler({
                methodName: 'getProductImagesByProductId',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsProductImageController_getMainProductImage: Record<string, TsoaRoute.ParameterSchema> = {
                productId: {"in":"path","name":"productId","required":true,"dataType":"double"},
        };
        app.get('/product-images/product/:productId/main',
            ...(fetchMiddlewares<RequestHandler>(ProductImageController)),
            ...(fetchMiddlewares<RequestHandler>(ProductImageController.prototype.getMainProductImage)),

            async function ProductImageController_getMainProductImage(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsProductImageController_getMainProductImage, request, response });

                const controller = new ProductImageController();

              await templateService.apiHandler({
                methodName: 'getMainProductImage',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsProductImageController_setMainImage: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
                productId: {"in":"path","name":"productId","required":true,"dataType":"double"},
        };
        app.put('/product-images/:id/main/product/:productId',
            ...(fetchMiddlewares<RequestHandler>(ProductImageController)),
            ...(fetchMiddlewares<RequestHandler>(ProductImageController.prototype.setMainImage)),

            async function ProductImageController_setMainImage(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsProductImageController_setMainImage, request, response });

                const controller = new ProductImageController();

              await templateService.apiHandler({
                methodName: 'setMainImage',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsProductImageController_updateSortOrder: Record<string, TsoaRoute.ParameterSchema> = {
                requestBody: {"in":"body","name":"requestBody","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"imageIds":{"dataType":"array","array":{"dataType":"double"},"required":true}}},
        };
        app.put('/product-images/sort-order',
            ...(fetchMiddlewares<RequestHandler>(ProductImageController)),
            ...(fetchMiddlewares<RequestHandler>(ProductImageController.prototype.updateSortOrder)),

            async function ProductImageController_updateSortOrder(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsProductImageController_updateSortOrder, request, response });

                const controller = new ProductImageController();

              await templateService.apiHandler({
                methodName: 'updateSortOrder',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsProductImageController_seedTestData: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.post('/product-images/seed',
            ...(fetchMiddlewares<RequestHandler>(ProductImageController)),
            ...(fetchMiddlewares<RequestHandler>(ProductImageController.prototype.seedTestData)),

            async function ProductImageController_seedTestData(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsProductImageController_seedTestData, request, response });

                const controller = new ProductImageController();

              await templateService.apiHandler({
                methodName: 'seedTestData',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCategoryController_getCategories: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/categories',
            ...(fetchMiddlewares<RequestHandler>(CategoryController)),
            ...(fetchMiddlewares<RequestHandler>(CategoryController.prototype.getCategories)),

            async function CategoryController_getCategories(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCategoryController_getCategories, request, response });

                const controller = new CategoryController();

              await templateService.apiHandler({
                methodName: 'getCategories',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCategoryController_getCategoryMeta: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/categories/metadata',
            ...(fetchMiddlewares<RequestHandler>(CategoryController)),
            ...(fetchMiddlewares<RequestHandler>(CategoryController.prototype.getCategoryMeta)),

            async function CategoryController_getCategoryMeta(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCategoryController_getCategoryMeta, request, response });

                const controller = new CategoryController();

              await templateService.apiHandler({
                methodName: 'getCategoryMeta',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCategoryController_getCategory: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
        };
        app.get('/categories/:id',
            ...(fetchMiddlewares<RequestHandler>(CategoryController)),
            ...(fetchMiddlewares<RequestHandler>(CategoryController.prototype.getCategory)),

            async function CategoryController_getCategory(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCategoryController_getCategory, request, response });

                const controller = new CategoryController();

              await templateService.apiHandler({
                methodName: 'getCategory',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCategoryController_createCategory: Record<string, TsoaRoute.ParameterSchema> = {
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"CreateCategoryDto"},
        };
        app.post('/categories',
            ...(fetchMiddlewares<RequestHandler>(CategoryController)),
            ...(fetchMiddlewares<RequestHandler>(CategoryController.prototype.createCategory)),

            async function CategoryController_createCategory(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCategoryController_createCategory, request, response });

                const controller = new CategoryController();

              await templateService.apiHandler({
                methodName: 'createCategory',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCategoryController_updateCategory: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"UpdateCategoryDto"},
        };
        app.put('/categories/:id',
            ...(fetchMiddlewares<RequestHandler>(CategoryController)),
            ...(fetchMiddlewares<RequestHandler>(CategoryController.prototype.updateCategory)),

            async function CategoryController_updateCategory(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCategoryController_updateCategory, request, response });

                const controller = new CategoryController();

              await templateService.apiHandler({
                methodName: 'updateCategory',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCategoryController_deleteCategory: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
        };
        app.delete('/categories/:id',
            ...(fetchMiddlewares<RequestHandler>(CategoryController)),
            ...(fetchMiddlewares<RequestHandler>(CategoryController.prototype.deleteCategory)),

            async function CategoryController_deleteCategory(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCategoryController_deleteCategory, request, response });

                const controller = new CategoryController();

              await templateService.apiHandler({
                methodName: 'deleteCategory',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCategoryController_getSubcategories: Record<string, TsoaRoute.ParameterSchema> = {
                parentId: {"in":"path","name":"parentId","required":true,"dataType":"double"},
        };
        app.get('/categories/subcategories/:parentId',
            ...(fetchMiddlewares<RequestHandler>(CategoryController)),
            ...(fetchMiddlewares<RequestHandler>(CategoryController.prototype.getSubcategories)),

            async function CategoryController_getSubcategories(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCategoryController_getSubcategories, request, response });

                const controller = new CategoryController();

              await templateService.apiHandler({
                methodName: 'getSubcategories',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCategoryController_getCategoriesByLevel: Record<string, TsoaRoute.ParameterSchema> = {
                level: {"in":"path","name":"level","required":true,"dataType":"double"},
        };
        app.get('/categories/level/:level',
            ...(fetchMiddlewares<RequestHandler>(CategoryController)),
            ...(fetchMiddlewares<RequestHandler>(CategoryController.prototype.getCategoriesByLevel)),

            async function CategoryController_getCategoriesByLevel(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCategoryController_getCategoriesByLevel, request, response });

                const controller = new CategoryController();

              await templateService.apiHandler({
                methodName: 'getCategoriesByLevel',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCategoryController_seedTestData: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.post('/categories/seed',
            ...(fetchMiddlewares<RequestHandler>(CategoryController)),
            ...(fetchMiddlewares<RequestHandler>(CategoryController.prototype.seedTestData)),

            async function CategoryController_seedTestData(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCategoryController_seedTestData, request, response });

                const controller = new CategoryController();

              await templateService.apiHandler({
                methodName: 'seedTestData',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsUserController_getUsers: Record<string, TsoaRoute.ParameterSchema> = {
                page: {"default":1,"in":"query","name":"page","dataType":"double"},
                limit: {"default":10,"in":"query","name":"limit","dataType":"double"},
                firstName: {"in":"query","name":"firstName","dataType":"string"},
                lastName: {"in":"query","name":"lastName","dataType":"string"},
                email: {"in":"query","name":"email","dataType":"string"},
        };
        app.get('/users',
            ...(fetchMiddlewares<RequestHandler>(UserController)),
            ...(fetchMiddlewares<RequestHandler>(UserController.prototype.getUsers)),

            async function UserController_getUsers(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUserController_getUsers, request, response });

                const controller = new UserController();

              await templateService.apiHandler({
                methodName: 'getUsers',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsUserController_getUser: Record<string, TsoaRoute.ParameterSchema> = {
                userId: {"in":"path","name":"userId","required":true,"dataType":"double"},
        };
        app.get('/users/:userId',
            ...(fetchMiddlewares<RequestHandler>(UserController)),
            ...(fetchMiddlewares<RequestHandler>(UserController.prototype.getUser)),

            async function UserController_getUser(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUserController_getUser, request, response });

                const controller = new UserController();

              await templateService.apiHandler({
                methodName: 'getUser',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsUserController_createUser: Record<string, TsoaRoute.ParameterSchema> = {
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"CreateUserDto"},
        };
        app.post('/users',
            ...(fetchMiddlewares<RequestHandler>(UserController)),
            ...(fetchMiddlewares<RequestHandler>(UserController.prototype.createUser)),

            async function UserController_createUser(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUserController_createUser, request, response });

                const controller = new UserController();

              await templateService.apiHandler({
                methodName: 'createUser',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsUserController_updateUser: Record<string, TsoaRoute.ParameterSchema> = {
                userId: {"in":"path","name":"userId","required":true,"dataType":"double"},
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"UpdateUserDto"},
        };
        app.put('/users/:userId',
            ...(fetchMiddlewares<RequestHandler>(UserController)),
            ...(fetchMiddlewares<RequestHandler>(UserController.prototype.updateUser)),

            async function UserController_updateUser(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUserController_updateUser, request, response });

                const controller = new UserController();

              await templateService.apiHandler({
                methodName: 'updateUser',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsUserController_deleteUser: Record<string, TsoaRoute.ParameterSchema> = {
                userId: {"in":"path","name":"userId","required":true,"dataType":"double"},
        };
        app.delete('/users/:userId',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(UserController)),
            ...(fetchMiddlewares<RequestHandler>(UserController.prototype.deleteUser)),

            async function UserController_deleteUser(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUserController_deleteUser, request, response });

                const controller = new UserController();

              await templateService.apiHandler({
                methodName: 'deleteUser',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsUserRoleController_getUserRoles: Record<string, TsoaRoute.ParameterSchema> = {
                userId: {"in":"path","name":"userId","required":true,"dataType":"double"},
        };
        app.get('/user-roles/user/:userId',
            ...(fetchMiddlewares<RequestHandler>(UserRoleController)),
            ...(fetchMiddlewares<RequestHandler>(UserRoleController.prototype.getUserRoles)),

            async function UserRoleController_getUserRoles(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUserRoleController_getUserRoles, request, response });

                const controller = new UserRoleController();

              await templateService.apiHandler({
                methodName: 'getUserRoles',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsUserRoleController_getUserRole: Record<string, TsoaRoute.ParameterSchema> = {
                userId: {"in":"path","name":"userId","required":true,"dataType":"double"},
                roleId: {"in":"path","name":"roleId","required":true,"dataType":"double"},
        };
        app.get('/user-roles/user/:userId/role/:roleId',
            ...(fetchMiddlewares<RequestHandler>(UserRoleController)),
            ...(fetchMiddlewares<RequestHandler>(UserRoleController.prototype.getUserRole)),

            async function UserRoleController_getUserRole(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUserRoleController_getUserRole, request, response });

                const controller = new UserRoleController();

              await templateService.apiHandler({
                methodName: 'getUserRole',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsUserRoleController_assignRole: Record<string, TsoaRoute.ParameterSchema> = {
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"AssignRoleRequest"},
        };
        app.post('/user-roles',
            ...(fetchMiddlewares<RequestHandler>(UserRoleController)),
            ...(fetchMiddlewares<RequestHandler>(UserRoleController.prototype.assignRole)),

            async function UserRoleController_assignRole(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUserRoleController_assignRole, request, response });

                const controller = new UserRoleController();

              await templateService.apiHandler({
                methodName: 'assignRole',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsUserRoleController_updateUserRole: Record<string, TsoaRoute.ParameterSchema> = {
                userId: {"in":"path","name":"userId","required":true,"dataType":"double"},
                roleId: {"in":"path","name":"roleId","required":true,"dataType":"double"},
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"UpdateRoleRequest"},
        };
        app.put('/user-roles/user/:userId/role/:roleId',
            ...(fetchMiddlewares<RequestHandler>(UserRoleController)),
            ...(fetchMiddlewares<RequestHandler>(UserRoleController.prototype.updateUserRole)),

            async function UserRoleController_updateUserRole(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUserRoleController_updateUserRole, request, response });

                const controller = new UserRoleController();

              await templateService.apiHandler({
                methodName: 'updateUserRole',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsUserRoleController_removeRole: Record<string, TsoaRoute.ParameterSchema> = {
                userId: {"in":"path","name":"userId","required":true,"dataType":"double"},
                roleId: {"in":"path","name":"roleId","required":true,"dataType":"double"},
        };
        app.delete('/user-roles/user/:userId/role/:roleId',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(UserRoleController)),
            ...(fetchMiddlewares<RequestHandler>(UserRoleController.prototype.removeRole)),

            async function UserRoleController_removeRole(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUserRoleController_removeRole, request, response });

                const controller = new UserRoleController();

              await templateService.apiHandler({
                methodName: 'removeRole',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsUserRoleController_deactivateUserRoles: Record<string, TsoaRoute.ParameterSchema> = {
                userId: {"in":"path","name":"userId","required":true,"dataType":"double"},
        };
        app.put('/user-roles/user/:userId/deactivate',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(UserRoleController)),
            ...(fetchMiddlewares<RequestHandler>(UserRoleController.prototype.deactivateUserRoles)),

            async function UserRoleController_deactivateUserRoles(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUserRoleController_deactivateUserRoles, request, response });

                const controller = new UserRoleController();

              await templateService.apiHandler({
                methodName: 'deactivateUserRoles',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function authenticateMiddleware(security: TsoaRoute.Security[] = []) {
        return async function runAuthenticationMiddleware(request: any, response: any, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            // keep track of failed auth attempts so we can hand back the most
            // recent one.  This behavior was previously existing so preserving it
            // here
            const failedAttempts: any[] = [];
            const pushAndRethrow = (error: any) => {
                failedAttempts.push(error);
                throw error;
            };

            const secMethodOrPromises: Promise<any>[] = [];
            for (const secMethod of security) {
                if (Object.keys(secMethod).length > 1) {
                    const secMethodAndPromises: Promise<any>[] = [];

                    for (const name in secMethod) {
                        secMethodAndPromises.push(
                            expressAuthenticationRecasted(request, name, secMethod[name], response)
                                .catch(pushAndRethrow)
                        );
                    }

                    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

                    secMethodOrPromises.push(Promise.all(secMethodAndPromises)
                        .then(users => { return users[0]; }));
                } else {
                    for (const name in secMethod) {
                        secMethodOrPromises.push(
                            expressAuthenticationRecasted(request, name, secMethod[name], response)
                                .catch(pushAndRethrow)
                        );
                    }
                }
            }

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            try {
                request['user'] = await Promise.any(secMethodOrPromises);

                // Response was sent in middleware, abort
                if (response.writableEnded) {
                    return;
                }

                next();
            }
            catch(err) {
                // Show most recent error as response
                const error = failedAttempts.pop();
                error.status = error.status || 401;

                // Response was sent in middleware, abort
                if (response.writableEnded) {
                    return;
                }
                next(error);
            }

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        }
    }

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
