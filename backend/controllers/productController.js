// Product Controller - handles all product-related business logic
class ProductController {
  
  // Helper function to fix image URLs for production
  static fixImageUrls(images) {
    if (!images || !Array.isArray(images)) return [];
    
    const backendUrl = process.env.BACKEND_URL || 'https://fashion-hub-backend-o7bo.onrender.com';
    
    return images.map(img => {
      // If image URL contains localhost, replace it with production URL
      if (img && img.includes('localhost')) {
        return img.replace(/http:\/\/localhost:\d+/, backendUrl);
      }
      // If image URL is relative, make it absolute
      if (img && !img.startsWith('http')) {
        return `${backendUrl}${img.startsWith('/') ? '' : '/'}${img}`;
      }
      return img;
    });
  }
  
  // Get all products with category and subcategory details
  static async getAllProducts(req, res) {
    try {
      const connection = req.dbConnection;
      
      const query = `
        SELECT 
          p.product_id,
          p.product_name,
          p.price,
          p.quantity,
          p.sizes,
          p.discount,
          p.fabric,
          p.tags,
          p.colour,
          p.type,
          p.images,
          p.created_at,
          c.name as category_name,
          s.name as subcategory_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.category_id
        LEFT JOIN subcategories s ON p.subcategory_id = s.subcategory_id
        ORDER BY p.created_at DESC
      `;
      
      const [products] = await connection.execute(query);
      
      // Process products to match frontend expectations
      const processedProducts = products.map(product => ({
        id: product.product_id,
        name: product.product_name,
        description: product.product_name, // Using name as description for now
        price: parseFloat(product.price),
        discount: parseFloat(product.discount) || 0,
        quantity: product.quantity,
        category: product.category_name,
        subcategory: product.subcategory_name,
        unit: 'piece', // Default unit
        material: product.fabric,
        status: product.quantity > 0 ? 'active' : 'inactive',
        type: product.type,
        sizes: product.sizes ? product.sizes.split(',') : [],
        color: product.colour,
        tags: product.tags ? product.tags.split(',') : [],
        images: ProductController.fixImageUrls(product.images ? JSON.parse(product.images) : []),
        createdAt: product.created_at,
        updatedAt: product.created_at
      }));
      
      res.json({
        success: true,
        message: 'Products retrieved successfully',
        data: processedProducts,
        total: processedProducts.length
      });
      
    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve products',
        message: error.message
      });
    }
  }

  // Get single product by ID
  static async getProductById(req, res) {
    try {
      const connection = req.dbConnection;
      const { id } = req.params;
      
      const query = `
        SELECT 
          p.*,
          c.name as category_name,
          s.name as subcategory_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.category_id
        LEFT JOIN subcategories s ON p.subcategory_id = s.subcategory_id
        WHERE p.product_id = ?
      `;
      
      const [products] = await connection.execute(query, [id]);
      
      if (products.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }
      
      const product = products[0];
      const processedProduct = {
        id: product.product_id,
        name: product.product_name,
        description: product.product_name,
        price: parseFloat(product.price),
        discount: parseFloat(product.discount) || 0,
        quantity: product.quantity,
        category: product.category_name,
        subcategory: product.subcategory_name,
        material: product.fabric,
        type: product.type,
        sizes: product.sizes ? product.sizes.split(',') : [],
        color: product.colour,
        tags: product.tags ? product.tags.split(',') : [],
        images: ProductController.fixImageUrls(product.images ? JSON.parse(product.images) : []),
        createdAt: product.created_at
      };
      
      res.json({
        success: true,
        message: 'Product retrieved successfully',
        data: processedProduct
      });
      
    } catch (error) {
      console.error('Get product error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve product',
        message: error.message
      });
    }
  }

  // Create new product
  static async createProduct(req, res) {
    try {
      const connection = req.dbConnection;
      const {
        name,
        price,
        quantity,
        category,
        subcategory,
        type,
        fabric,
        sizes,
        discount,
        colour,
        tags,
        images
      } = req.body;

      // Validate required fields
      if (!name || !price || !quantity || !category || !subcategory || !type) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          required: ['name', 'price', 'quantity', 'category', 'subcategory', 'type']
        });
      }

      // Get category_id and subcategory_id
      const [categories] = await connection.execute(
        'SELECT category_id FROM categories WHERE name = ?',
        [category]
      );
      
      if (categories.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid category'
        });
      }

      const [subcategories] = await connection.execute(
        'SELECT subcategory_id FROM subcategories WHERE name = ? AND category_id = ?',
        [subcategory, categories[0].category_id]
      );
      
      if (subcategories.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid subcategory for the selected category'
        });
      }

      // Prepare data for insertion
      const sizesString = Array.isArray(sizes) ? sizes.join(',') : sizes || '';
      const tagsString = Array.isArray(tags) ? tags.join(',') : tags || '';
      const imagesString = images ? JSON.stringify(images) : null;

      const insertQuery = `
        INSERT INTO products (
          product_name, category_id, subcategory_id, type, price, 
          quantity, sizes, discount, fabric, tags, colour, images
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await connection.execute(insertQuery, [
        name,
        categories[0].category_id,
        subcategories[0].subcategory_id,
        type,
        parseFloat(price),
        parseInt(quantity),
        sizesString,
        parseFloat(discount) || 0,
        fabric || null,
        tagsString,
        colour || null,
        imagesString
      ]);

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: {
          id: result.insertId,
          name,
          price: parseFloat(price),
          quantity: parseInt(quantity),
          category,
          subcategory,
          type
        }
      });

    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create product',
        message: error.message
      });
    }
  }

  // Update existing product
  static async updateProduct(req, res) {
    try {
      const connection = req.dbConnection;
      const { id } = req.params;
      const updateData = req.body;

      // Check if product exists
      const [existingProducts] = await connection.execute(
        'SELECT product_id FROM products WHERE product_id = ?',
        [id]
      );

      if (existingProducts.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }

      // Build dynamic update query
      const updateFields = [];
      const updateValues = [];

      if (updateData.name) {
        updateFields.push('product_name = ?');
        updateValues.push(updateData.name);
      }
      if (updateData.price) {
        updateFields.push('price = ?');
        updateValues.push(parseFloat(updateData.price));
      }
      if (updateData.quantity !== undefined) {
        updateFields.push('quantity = ?');
        updateValues.push(parseInt(updateData.quantity));
      }
      if (updateData.discount !== undefined) {
        updateFields.push('discount = ?');
        updateValues.push(parseFloat(updateData.discount));
      }
      if (updateData.fabric) {
        updateFields.push('fabric = ?');
        updateValues.push(updateData.fabric);
      }
      if (updateData.colour) {
        updateFields.push('colour = ?');
        updateValues.push(updateData.colour);
      }
      if (updateData.type) {
        updateFields.push('type = ?');
        updateValues.push(updateData.type);
      }
      if (updateData.category_id) {
        updateFields.push('category_id = ?');
        updateValues.push(parseInt(updateData.category_id));
      }
      if (updateData.subcategory_id) {
        updateFields.push('subcategory_id = ?');
        updateValues.push(parseInt(updateData.subcategory_id));
      }
      if (updateData.sizes) {
        const sizesString = Array.isArray(updateData.sizes) ? 
          updateData.sizes.join(',') : updateData.sizes;
        updateFields.push('sizes = ?');
        updateValues.push(sizesString);
      }
      if (updateData.tags) {
        const tagsString = Array.isArray(updateData.tags) ? 
          updateData.tags.join(',') : updateData.tags;
        updateFields.push('tags = ?');
        updateValues.push(tagsString);
      }
      if (updateData.images) {
        updateFields.push('images = ?');
        updateValues.push(JSON.stringify(updateData.images));
      }

      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No valid fields to update'
        });
      }

      updateValues.push(id);
      const updateQuery = `UPDATE products SET ${updateFields.join(', ')} WHERE product_id = ?`;

      await connection.execute(updateQuery, updateValues);

      res.json({
        success: true,
        message: 'Product updated successfully',
        data: { id, ...updateData }
      });

    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update product',
        message: error.message
      });
    }
  }

  // Delete product
  static async deleteProduct(req, res) {
    try {
      const connection = req.dbConnection;
      const { id } = req.params;

      // Check if product exists
      const [existingProducts] = await connection.execute(
        'SELECT product_id FROM products WHERE product_id = ?',
        [id]
      );

      if (existingProducts.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }

      await connection.execute('DELETE FROM products WHERE product_id = ?', [id]);

      res.json({
        success: true,
        message: 'Product deleted successfully',
        data: { id }
      });

    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete product',
        message: error.message
      });
    }
  }

  // Get all categories
  static async getCategories(req, res) {
    try {
      const connection = req.dbConnection;
      
      const [categories] = await connection.execute(
        'SELECT category_id as id, name FROM categories ORDER BY name'
      );

      res.json({
        success: true,
        message: 'Categories retrieved successfully',
        data: categories
      });

    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve categories',
        message: error.message
      });
    }
  }

  // Get subcategories by category
  static async getSubcategories(req, res) {
    try {
      const connection = req.dbConnection;
      const { categoryId } = req.params;

      const query = `
        SELECT s.subcategory_id as id, s.name, s.category_id
        FROM subcategories s
        WHERE s.category_id = ?
        ORDER BY s.name
      `;

      const [subcategories] = await connection.execute(query, [categoryId]);

      res.json({
        success: true,
        message: 'Subcategories retrieved successfully',
        data: subcategories
      });

    } catch (error) {
      console.error('Get subcategories error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve subcategories',
        message: error.message
      });
    }
  }

  // Search products
  static async searchProducts(req, res) {
    try {
      const connection = req.dbConnection;
      const { q } = req.query;

      if (!q || q.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Search query is required'
        });
      }

      // Minimum 2 characters for search
      if (q.trim().length < 2) {
        return res.json({
          success: true,
          message: 'Please enter at least 2 characters',
          data: [],
          total: 0
        });
      }

      const searchTerm = q.trim().toLowerCase();
      const searchPattern = `%${searchTerm}%`;
      
      // Fuzzy search: Create variations for common typos
      // Remove vowels for fuzzy matching (shirt -> shrt, sirt -> shrt)
      const fuzzyTerm = searchTerm.replace(/[aeiou]/gi, '');
      const fuzzyPattern = `%${fuzzyTerm}%`;
      
      const query = `
        SELECT 
          p.product_id,
          p.product_name,
          p.price,
          p.quantity,
          p.sizes,
          p.discount,
          p.fabric,
          p.tags,
          p.colour,
          p.type,
          p.images,
          p.created_at,
          c.name as category_name,
          s.name as subcategory_name,
          CASE 
            WHEN LOWER(p.product_name) LIKE ? THEN 1
            WHEN LOWER(p.product_name) LIKE ? THEN 2
            WHEN LOWER(p.tags) LIKE ? THEN 3
            WHEN LOWER(c.name) LIKE ? THEN 4
            WHEN LOWER(s.name) LIKE ? THEN 5
            WHEN LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(p.product_name, 'a', ''), 'e', ''), 'i', ''), 'o', ''), 'u', '')) LIKE ? THEN 6
            ELSE 7
          END as relevance
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.category_id
        LEFT JOIN subcategories s ON p.subcategory_id = s.subcategory_id
        WHERE (
          LOWER(p.product_name) LIKE ? OR 
          LOWER(p.fabric) LIKE ? OR 
          LOWER(p.tags) LIKE ? OR 
          LOWER(p.colour) LIKE ? OR 
          LOWER(p.type) LIKE ? OR
          LOWER(c.name) LIKE ? OR
          LOWER(s.name) LIKE ? OR
          LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(p.product_name, 'a', ''), 'e', ''), 'i', ''), 'o', ''), 'u', '')) LIKE ?
        )
        AND p.quantity > 0
        ORDER BY relevance, p.created_at DESC
        LIMIT 50
      `;

      const [products] = await connection.execute(query, [
        searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, fuzzyPattern,
        searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, fuzzyPattern
      ]);

      const processedProducts = products.map(product => ({
        id: product.product_id,
        name: product.product_name,
        description: product.product_name,
        price: parseFloat(product.price),
        discount: parseFloat(product.discount) || 0,
        quantity: product.quantity,
        category: product.category_name,
        subcategory: product.subcategory_name,
        unit: 'piece',
        material: product.fabric,
        status: product.quantity > 0 ? 'active' : 'inactive',
        type: product.type,
        sizes: product.sizes ? product.sizes.split(',') : [],
        color: product.colour,
        tags: product.tags ? product.tags.split(',') : [],
        images: ProductController.fixImageUrls(product.images ? JSON.parse(product.images) : []),
        image_url: ProductController.fixImageUrls(product.images ? [JSON.parse(product.images)[0]] : [])[0] || null,
        createdAt: product.created_at,
        updatedAt: product.created_at
      }));

      res.json({
        success: true,
        message: `Found ${processedProducts.length} products for "${q}"`,
        data: processedProducts,
        total: processedProducts.length,
        query: q
      });

    } catch (error) {
      console.error('Search products error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search products',
        message: error.message
      });
    }
  }

  // Get products with filters
  static async getFilteredProducts(req, res) {
    try {
      const connection = req.dbConnection;
      const { category, subcategory, type, minPrice, maxPrice, search } = req.query;

      let query = `
        SELECT 
          p.product_id,
          p.product_name,
          p.price,
          p.quantity,
          p.sizes,
          p.discount,
          p.fabric,
          p.tags,
          p.colour,
          p.type,
          p.images,
          p.created_at,
          c.name as category_name,
          s.name as subcategory_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.category_id
        LEFT JOIN subcategories s ON p.subcategory_id = s.subcategory_id
        WHERE 1=1
      `;

      const queryParams = [];

      if (category) {
        query += ' AND c.name = ?';
        queryParams.push(category);
      }

      if (subcategory) {
        query += ' AND s.name = ?';
        queryParams.push(subcategory);
      }

      if (type) {
        query += ' AND p.type = ?';
        queryParams.push(type);
      }

      if (minPrice) {
        query += ' AND p.price >= ?';
        queryParams.push(parseFloat(minPrice));
      }

      if (maxPrice) {
        query += ' AND p.price <= ?';
        queryParams.push(parseFloat(maxPrice));
      }

      if (search) {
        query += ' AND (p.product_name LIKE ? OR p.fabric LIKE ? OR p.tags LIKE ?)';
        const searchTerm = `%${search}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm);
      }

      query += ' ORDER BY p.created_at DESC';

      const [products] = await connection.execute(query, queryParams);

      const processedProducts = products.map(product => ({
        id: product.product_id,
        name: product.product_name,
        description: product.product_name,
        price: parseFloat(product.price),
        discount: parseFloat(product.discount) || 0,
        quantity: product.quantity,
        category: product.category_name,
        subcategory: product.subcategory_name,
        unit: 'piece',
        material: product.fabric,
        status: product.quantity > 0 ? 'active' : 'inactive',
        type: product.type,
        sizes: product.sizes ? product.sizes.split(',') : [],
        color: product.colour,
        tags: product.tags ? product.tags.split(',') : [],
        images: ProductController.fixImageUrls(product.images ? JSON.parse(product.images) : []),
        createdAt: product.created_at,
        updatedAt: product.created_at
      }));

      res.json({
        success: true,
        message: 'Filtered products retrieved successfully',
        data: processedProducts,
        total: processedProducts.length,
        filters: { category, subcategory, type, minPrice, maxPrice, search }
      });

    } catch (error) {
      console.error('Get filtered products error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve filtered products',
        message: error.message
      });
    }
  }
}

module.exports = ProductController;