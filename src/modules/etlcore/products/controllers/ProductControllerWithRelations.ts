import { 
  Controller, 
  Get, 
  Path, 
  Route, 
  Query, 
  Tags, 
  SuccessResponse 
} from 'tsoa';
import { Request, Response } from 'express';
import { getRepository, Repository } from 'typeorm';
import { Product } from '../models/Product';
import { Category } from '../../categories/models/Category';
import { Supplier } from '../../suppliers/models/Supplier';
import { ProductImage } from '../../productimages/models/ProductImage';

/**
 * Controller pro demonstraci vztahů mezi entitami
 * 
 * Poskytuje ukázkové endpointy pro práci s relacemi mezi produkty, kategoriemi, dodavateli a obrázky
 */
@Route('products')
@Tags('Products Relations')
export class ProductControllerWithRelations extends Controller {
  
  private productRepository: Repository<Product>;
  
  constructor() {
    super();
    this.productRepository = getRepository(Product);
  }

  /**
   * Získání produktu včetně všech vztahů podle ID
   * 
   * Umožňuje volitelně expandovat související entity (kategorie, obrázky, dodavatele)
   * Příklad: /products/1?expand=category,images,suppliers
   */
  @Get('{id}')
  @SuccessResponse('200', 'Product retrieved with requested relations')
  public async getProductWithAllRelations(
    @Path() id: number,
    @Query() expand?: string
  ) {
    try {
      // Rozdělení query parametru expand na pole
      const relations = expand ? expand.split(',') : [];
      
      // Vytvoření základního query builderu
      const queryBuilder = this.productRepository
        .createQueryBuilder('product')
        .where('product.id = :id', { id });
      
      // Dynamické přidání vztahů podle parametru expand
      if (relations.includes('category')) {
        queryBuilder.leftJoinAndSelect('product.category', 'category');
      }
      
      if (relations.includes('images')) {
        queryBuilder.leftJoinAndMapMany(
          'product.images',
          ProductImage,
          'images',
          'images.productId = product.id'
        )
        .orderBy('images.sortOrder', 'ASC');
      }
      
      if (relations.includes('suppliers')) {
        queryBuilder.leftJoinAndMapMany(
          'product.suppliers',
          Supplier,
          'supplier',
          'supplier.id IN (SELECT supplierId FROM supplier_products WHERE productId = :productId)',
          { productId: id }
        );
      }
      
      const product = await queryBuilder.getOne();
      
      if (!product) {
        this.setStatus(404);
        return { 
          success: false, 
          message: `Produkt s ID ${id} nebyl nalezen`
        };
      }
      
      return { 
        success: true, 
        data: product 
      };
    } catch (error) {
      this.setStatus(500);
      return { 
        success: false, 
        message: `Chyba při získávání produktu: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Získání produktu včetně souvisejících entit přes explicitní endpoint
   * 
   * Alternativní způsob, pokud klient nepodporuje parametr expand
   */
  @Get('{id}/with-relations')
  @SuccessResponse('200', 'Product retrieved with all relations')
  public async getProductWithRelations(
    @Path() id: number
  ) {
    try {
      const queryBuilder = this.productRepository
        .createQueryBuilder('product')
        .where('product.id = :id', { id })
        .leftJoinAndSelect('product.category', 'category')
        .leftJoinAndMapMany(
          'product.images',
          ProductImage,
          'images',
          'images.productId = product.id'
        )
        .orderBy('images.sortOrder', 'ASC')
        .leftJoinAndMapMany(
          'product.suppliers',
          Supplier,
          'supplier',
          'supplier.id IN (SELECT supplierId FROM supplier_products WHERE productId = :productId)',
          { productId: id }
        );
        
      const product = await queryBuilder.getOne();
      
      if (!product) {
        this.setStatus(404);
        return { 
          success: false, 
          message: `Produkt s ID ${id} nebyl nalezen`
        };
      }
      
      return { 
        success: true, 
        data: product 
      };
    } catch (error) {
      this.setStatus(500);
      return { 
        success: false, 
        message: `Chyba při získávání produktu: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Získání všech produktů v kategorii
   */
  @Get('by-category/{categoryId}')
  @SuccessResponse('200', 'Products in category retrieved')
  public async getProductsByCategory(
    @Path() categoryId: number
  ) {
    try {
      const products = await this.productRepository
        .createQueryBuilder('product')
        .where('product.categoryId = :categoryId', { categoryId })
        .leftJoinAndSelect('product.category', 'category')
        .getMany();
      
      return { 
        success: true, 
        data: products,
        total: products.length
      };
    } catch (error) {
      this.setStatus(500);
      return { 
        success: false, 
        message: `Chyba při získávání produktů: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Získání obrázků produktu
   */
  @Get('{id}/images')
  @SuccessResponse('200', 'Product images retrieved')
  public async getProductImages(
    @Path() id: number
  ) {
    try {
      const images = await getRepository(ProductImage)
        .createQueryBuilder('image')
        .where('image.productId = :productId', { productId: id })
        .orderBy('image.sortOrder', 'ASC')
        .getMany();
      
      return { 
        success: true, 
        data: images,
        total: images.length
      };
    } catch (error) {
      this.setStatus(500);
      return { 
        success: false, 
        message: `Chyba při získávání obrázků: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Získání dodavatelů produktu
   */
  @Get('{id}/suppliers')
  @SuccessResponse('200', 'Product suppliers retrieved')
  public async getProductSuppliers(
    @Path() id: number
  ) {
    try {
      const suppliers = await getRepository(Supplier)
        .createQueryBuilder('supplier')
        .where(qb => {
          const subQuery = qb
            .subQuery()
            .select('sp.supplierId')
            .from('supplier_products', 'sp')
            .where('sp.productId = :productId')
            .getQuery();
          return 'supplier.id IN ' + subQuery;
        })
        .setParameter('productId', id)
        .getMany();
      
      return { 
        success: true, 
        data: suppliers,
        total: suppliers.length
      };
    } catch (error) {
      this.setStatus(500);
      return { 
        success: false, 
        message: `Chyba při získávání dodavatelů: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}