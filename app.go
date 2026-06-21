package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"

	_ "modernc.org/sqlite"
)

// User represents a system user with role details
type User struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Role     string `json:"role"`
	Password string `json:"password"`
}

// App struct
type App struct {
	ctx context.Context
	db  *sql.DB
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods. It also opens the SQLite database.
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	// Open the SQLite database
	db, err := sql.Open("sqlite", "stock.db")
	if err != nil {
		log.Fatalf("Falha ao abrir banco de dados SQLite: %v", err)
	}
	a.db = db

	// Create users table if not exists
	createTableQuery := `
	CREATE TABLE IF NOT EXISTS users (
		username TEXT PRIMARY KEY,
		email TEXT NOT NULL,
		role TEXT NOT NULL
	);`
	_, err = a.db.Exec(createTableQuery)
	if err != nil {
		log.Fatalf("Falha ao criar tabela users: %v", err)
	}

	// Migration: drop permissions column from legacy databases
	_, err = a.db.Exec("ALTER TABLE users DROP COLUMN permissions")
	if err != nil {
		// Column already dropped or never existed — ignore
	}

	// Migration: add password column if it doesn't exist (legacy databases)
	_, err = a.db.Exec("ALTER TABLE users ADD COLUMN password TEXT NOT NULL DEFAULT 'admin123'")
	if err != nil {
		// Column already exists — ignore
	}

	// Seed default admin user if not exists
	_, err = a.db.Exec("INSERT OR IGNORE INTO users (username, email, role, password) VALUES ('admin', 'admin@sistema.com', 'Administrador', 'admin123')")
	if err != nil {
		log.Printf("Aviso: não foi possível criar usuário padrão: %v", err)
	}

	// Create customers table if not exists
	createCustomersQuery := `
	CREATE TABLE IF NOT EXISTS customers (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		razao_social TEXT NOT NULL,
		cnpj TEXT NOT NULL UNIQUE,
		endereco TEXT NOT NULL,
		bairro TEXT NOT NULL,
		cidade TEXT NOT NULL,
		cep TEXT NOT NULL
	);`
	_, err = a.db.Exec(createCustomersQuery)
	if err != nil {
		log.Fatalf("Falha ao criar tabela customers: %v", err)
	}

	// Create products table if not exists
	createProductsQuery := `
	CREATE TABLE IF NOT EXISTS products (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		description TEXT NOT NULL DEFAULT '',
		price REAL NOT NULL DEFAULT 0,
		category TEXT NOT NULL DEFAULT '',
		quantity INTEGER NOT NULL DEFAULT 0,
		min_stock INTEGER NOT NULL DEFAULT 0
	);`
	_, err = a.db.Exec(createProductsQuery)
	if err != nil {
		log.Fatalf("Falha ao criar tabela products: %v", err)
	}

	// Migration: add min_stock column if it doesn't exist (legacy databases)
	_, err = a.db.Exec("ALTER TABLE products ADD COLUMN min_stock INTEGER NOT NULL DEFAULT 0")
	if err != nil {
		// Column already exists — ignore
	}

	// Create vendas table if not exists
	createVendasQuery := `
	CREATE TABLE IF NOT EXISTS vendas (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		username TEXT NOT NULL,
		user_name TEXT NOT NULL,
		cliente_id INTEGER NOT NULL,
		cliente_nome TEXT NOT NULL,
		produto_id INTEGER NOT NULL,
		produto_nome TEXT NOT NULL,
		quantidade INTEGER NOT NULL,
		preco_unitario REAL NOT NULL DEFAULT 0,
		total REAL NOT NULL DEFAULT 0,
		data_venda TEXT NOT NULL
	);`
	_, err = a.db.Exec(createVendasQuery)
	if err != nil {
		log.Fatalf("Falha ao criar tabela vendas: %v", err)
	}

	// Create compras table if not exists
	createComprasQuery := `
	CREATE TABLE IF NOT EXISTS compras (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		produto_id INTEGER NOT NULL,
		produto_nome TEXT NOT NULL,
		quantidade INTEGER NOT NULL,
		preco_unitario REAL NOT NULL DEFAULT 0,
		total REAL NOT NULL DEFAULT 0,
		data_compra TEXT NOT NULL
	);`
	_, err = a.db.Exec(createComprasQuery)
	if err != nil {
		log.Fatalf("Falha ao criar tabela compras: %v", err)
	}

	// Insert the default admin user if the table is empty
	var count int
	err = a.db.QueryRow("SELECT COUNT(*) FROM users").Scan(&count)
	if err != nil {
		log.Printf("Erro ao verificar tabela users: %v", err)
		return
	}

	if count == 0 {
		_, err = a.db.Exec("INSERT INTO users (username, email, role) VALUES (?, ?, ?)",
			"admin", "admin@example.com", "Administrador")
		if err != nil {
			log.Printf("Erro ao inserir administrador padrão: %v", err)
		}
	}
}

// shutdown is called when the application closes
func (a *App) shutdown(ctx context.Context) {
	if a.db != nil {
		_ = a.db.Close()
	}
}

// LoginResponse represents the response details for a login request
type LoginResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

// Login verifies the credentials of a user against the database
func (a *App) Login(username, password string) LoginResponse {
	var dbPassword string
	err := a.db.QueryRow("SELECT password FROM users WHERE username = ?", username).Scan(&dbPassword)
	if err != nil {
		if err == sql.ErrNoRows {
			return LoginResponse{
				Success: false,
				Message: "Usuário não encontrado.",
			}
		}
		return LoginResponse{
			Success: false,
			Message: "Erro ao consultar o banco de dados.",
		}
	}

	if password != dbPassword {
		return LoginResponse{
			Success: false,
			Message: "Senha incorreta.",
		}
	}

	return LoginResponse{
		Success: true,
		Message: "Bem-vindo de volta!",
	}
}

// GetUsers returns the current list of registered users from the SQLite database
func (a *App) GetUsers() []User {
	if a.db == nil {
		return []User{}
	}

	rows, err := a.db.Query("SELECT username, email, role FROM users")
	if err != nil {
		log.Printf("Erro ao buscar usuários: %v", err)
		return []User{}
	}
	defer rows.Close()

	var users []User
	for rows.Next() {
		var u User
		err := rows.Scan(&u.Username, &u.Email, &u.Role)
		if err != nil {
			log.Printf("Erro ao escanear linha de usuário: %v", err)
			continue
		}
		users = append(users, u)
	}

	return users
}

// CreateUserResponse represents the result of the user creation process
type CreateUserResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

// CreateUser registers a new user if the username is unique in the SQLite database
func (a *App) CreateUser(user User) CreateUserResponse {
	if a.db == nil {
		return CreateUserResponse{Success: false, Message: "Banco de dados não inicializado."}
	}

	if user.Username == "" || user.Email == "" {
		return CreateUserResponse{
			Success: false,
			Message: "Nome de usuário e email são obrigatórios.",
		}
	}

	if user.Password == "" {
		return CreateUserResponse{
			Success: false,
			Message: "Senha é obrigatória.",
		}
	}

	// Check if user already exists
	var existing string
	err := a.db.QueryRow("SELECT username FROM users WHERE username = ?", user.Username).Scan(&existing)
	if err == nil {
		return CreateUserResponse{
			Success: false,
			Message: "Este nome de usuário já está cadastrado.",
		}
	}

	_, err = a.db.Exec("INSERT INTO users (username, email, role, password) VALUES (?, ?, ?, ?)",
		user.Username, user.Email, user.Role, user.Password)
	if err != nil {
		return CreateUserResponse{
			Success: false,
			Message: "Erro ao salvar usuário no banco de dados.",
		}
	}

	return CreateUserResponse{
		Success: true,
		Message: "Usuário cadastrado com sucesso!",
	}
}

// DeleteUser removes a user by username from the SQLite database
func (a *App) DeleteUser(username string) bool {
	if a.db == nil {
		return false
	}

	if username == "admin" {
		return false // Cannot delete the main administrator account
	}

	_, err := a.db.Exec("DELETE FROM users WHERE username = ?", username)
	if err != nil {
		log.Printf("Erro ao deletar usuário: %v", err)
		return false
	}

	return true
}

// ---- CUSTOMER MANAGEMENT ----

// Customer represents a business customer with address details
type Customer struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	RazaoSocial string `json:"razao_social"`
	CNPJ        string `json:"cnpj"`
	Endereco    string `json:"endereco"`
	Bairro      string `json:"bairro"`
	Cidade      string `json:"cidade"`
	CEP         string `json:"cep"`
}

// CustomerResponse represents the result of a customer write operation
type CustomerResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

// GetCustomers returns all customers from the SQLite database
func (a *App) GetCustomers() []Customer {
	if a.db == nil {
		return []Customer{}
	}

	rows, err := a.db.Query("SELECT id, name, razao_social, cnpj, endereco, bairro, cidade, cep FROM customers ORDER BY name")
	if err != nil {
		log.Printf("Erro ao buscar clientes: %v", err)
		return []Customer{}
	}
	defer rows.Close()

	var customers []Customer
	for rows.Next() {
		var c Customer
		err := rows.Scan(&c.ID, &c.Name, &c.RazaoSocial, &c.CNPJ, &c.Endereco, &c.Bairro, &c.Cidade, &c.CEP)
		if err != nil {
			log.Printf("Erro ao escanear cliente: %v", err)
			continue
		}
		customers = append(customers, c)
	}

	return customers
}

// CreateCustomer inserts a new customer into the SQLite database
func (a *App) CreateCustomer(customer Customer) CustomerResponse {
	if a.db == nil {
		return CustomerResponse{Success: false, Message: "Banco de dados não inicializado."}
	}

	if customer.Name == "" || customer.CNPJ == "" {
		return CustomerResponse{
			Success: false,
			Message: "Nome do cliente e CNPJ são obrigatórios.",
		}
	}

	// Check if CNPJ already exists
	var existing int
	err := a.db.QueryRow("SELECT id FROM customers WHERE cnpj = ?", customer.CNPJ).Scan(&existing)
	if err == nil {
		return CustomerResponse{
			Success: false,
			Message: "Já existe um cliente cadastrado com este CNPJ.",
		}
	}

	_, err = a.db.Exec(
		"INSERT INTO customers (name, razao_social, cnpj, endereco, bairro, cidade, cep) VALUES (?, ?, ?, ?, ?, ?, ?)",
		customer.Name, customer.RazaoSocial, customer.CNPJ,
		customer.Endereco, customer.Bairro, customer.Cidade, customer.CEP,
	)
	if err != nil {
		log.Printf("Erro ao inserir cliente: %v", err)
		return CustomerResponse{
			Success: false,
			Message: "Erro ao salvar cliente no banco de dados.",
		}
	}

	return CustomerResponse{
		Success: true,
		Message: "Cliente cadastrado com sucesso!",
	}
}

// DeleteCustomer removes a customer by ID from the SQLite database
func (a *App) DeleteCustomer(id int) bool {
	if a.db == nil {
		return false
	}

	_, err := a.db.Exec("DELETE FROM customers WHERE id = ?", id)
	if err != nil {
		log.Printf("Erro ao deletar cliente: %v", err)
		return false
	}

	return true
}

// ---- PRODUCT MANAGEMENT ----

// Product represents a product with pricing and stock information
type Product struct {
	ID          int     `json:"id"`
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Price       float64 `json:"price"`
	Category    string  `json:"category"`
	Quantity    int     `json:"quantity"`
	MinStock    int     `json:"min_stock"`
}

// ProductResponse represents the result of a product write operation
type ProductResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

// GetProducts returns all products from the SQLite database
func (a *App) GetProducts() []Product {
	if a.db == nil {
		return []Product{}
	}

	rows, err := a.db.Query("SELECT id, name, description, price, category, quantity, min_stock FROM products ORDER BY name")
	if err != nil {
		log.Printf("Erro ao buscar produtos: %v", err)
		return []Product{}
	}
	defer rows.Close()

	var products []Product
	for rows.Next() {
		var p Product
		err := rows.Scan(&p.ID, &p.Name, &p.Description, &p.Price, &p.Category, &p.Quantity, &p.MinStock)
		if err != nil {
			log.Printf("Erro ao escanear produto: %v", err)
			continue
		}
		products = append(products, p)
	}

	return products
}

// CreateProduct inserts a new product into the SQLite database
func (a *App) CreateProduct(product Product) ProductResponse {
	if a.db == nil {
		return ProductResponse{Success: false, Message: "Banco de dados não inicializado."}
	}

	if product.Name == "" {
		return ProductResponse{
			Success: false,
			Message: "Nome do produto é obrigatório.",
		}
	}

	_, err := a.db.Exec(
		"INSERT INTO products (name, description, price, category, quantity, min_stock) VALUES (?, ?, ?, ?, ?, ?)",
		product.Name, product.Description, product.Price, product.Category, product.Quantity, product.MinStock,
	)
	if err != nil {
		log.Printf("Erro ao inserir produto: %v", err)
		return ProductResponse{
			Success: false,
			Message: "Erro ao salvar produto no banco de dados.",
		}
	}

	return ProductResponse{
		Success: true,
		Message: "Produto cadastrado com sucesso!",
	}
}

// DeleteProduct removes a product by ID from the SQLite database
func (a *App) DeleteProduct(id int) bool {
	if a.db == nil {
		return false
	}

	_, err := a.db.Exec("DELETE FROM products WHERE id = ?", id)
	if err != nil {
		log.Printf("Erro ao deletar produto: %v", err)
		return false
	}

	return true
}

// ---- SALES (VENDAS) MANAGEMENT ----

// Venda represents a sale transaction
type Venda struct {
	ID            int     `json:"id"`
	Username      string  `json:"username"`
	UserName      string  `json:"user_name"`
	ClienteID     int     `json:"cliente_id"`
	ClienteNome   string  `json:"cliente_nome"`
	ProdutoID     int     `json:"produto_id"`
	ProdutoNome   string  `json:"produto_nome"`
	Quantidade    int     `json:"quantidade"`
	PrecoUnitario float64 `json:"preco_unitario"`
	Total         float64 `json:"total"`
	DataVenda     string  `json:"data_venda"`
}

// VendaResponse represents the result of a sale write operation
type VendaResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

// GetVendas returns all sales from the SQLite database
func (a *App) GetVendas() []Venda {
	if a.db == nil {
		return []Venda{}
	}

	rows, err := a.db.Query("SELECT id, username, user_name, cliente_id, cliente_nome, produto_id, produto_nome, quantidade, preco_unitario, total, data_venda FROM vendas ORDER BY data_venda DESC")
	if err != nil {
		log.Printf("Erro ao buscar vendas: %v", err)
		return []Venda{}
	}
	defer rows.Close()

	var vendas []Venda
	for rows.Next() {
		var v Venda
		err := rows.Scan(&v.ID, &v.Username, &v.UserName, &v.ClienteID, &v.ClienteNome, &v.ProdutoID, &v.ProdutoNome, &v.Quantidade, &v.PrecoUnitario, &v.Total, &v.DataVenda)
		if err != nil {
			log.Printf("Erro ao escanear venda: %v", err)
			continue
		}
		vendas = append(vendas, v)
	}

	return vendas
}

// CreateVenda inserts a new sale into the SQLite database and updates product stock
func (a *App) CreateVenda(venda Venda) VendaResponse {
	if a.db == nil {
		return VendaResponse{Success: false, Message: "Banco de dados não inicializado."}
	}

	if venda.ClienteNome == "" || venda.ProdutoNome == "" || venda.Quantidade <= 0 {
		return VendaResponse{
			Success: false,
			Message: "Cliente, produto e quantidade são obrigatórios.",
		}
	}

	// Check current stock
	var currentStock int
	err := a.db.QueryRow("SELECT quantity FROM products WHERE id = ?", venda.ProdutoID).Scan(&currentStock)
	if err != nil {
		log.Printf("Erro ao consultar estoque: %v", err)
		return VendaResponse{Success: false, Message: "Erro ao consultar estoque do produto."}
	}

	if currentStock < venda.Quantidade {
		return VendaResponse{
			Success: false,
			Message: "Estoque insuficiente. Disponível: " + fmt.Sprintf("%d", currentStock) + ", solicitado: " + fmt.Sprintf("%d", venda.Quantidade) + ".",
		}
	}

	venda.Total = float64(venda.Quantidade) * venda.PrecoUnitario

	tx, err := a.db.Begin()
	if err != nil {
		log.Printf("Erro ao iniciar transação: %v", err)
		return VendaResponse{Success: false, Message: "Erro ao processar venda."}
	}
	defer tx.Rollback()

	_, err = tx.Exec(
		"INSERT INTO vendas (username, user_name, cliente_id, cliente_nome, produto_id, produto_nome, quantidade, preco_unitario, total, data_venda) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
		venda.Username, venda.UserName, venda.ClienteID, venda.ClienteNome,
		venda.ProdutoID, venda.ProdutoNome, venda.Quantidade, venda.PrecoUnitario,
		venda.Total, venda.DataVenda,
	)
	if err != nil {
		log.Printf("Erro ao inserir venda: %v", err)
		return VendaResponse{
			Success: false,
			Message: "Erro ao salvar venda no banco de dados.",
		}
	}

	_, err = tx.Exec("UPDATE products SET quantity = quantity - ? WHERE id = ?", venda.Quantidade, venda.ProdutoID)
	if err != nil {
		log.Printf("Erro ao atualizar estoque: %v", err)
		return VendaResponse{Success: false, Message: "Erro ao atualizar estoque."}
	}

	err = tx.Commit()
	if err != nil {
		log.Printf("Erro ao finalizar transação: %v", err)
		return VendaResponse{Success: false, Message: "Erro ao finalizar venda."}
	}

	return VendaResponse{
		Success: true,
		Message: "Venda registrada com sucesso!",
	}
}

// ---- PURCHASES (COMPRAS) MANAGEMENT ----

// Compra represents a purchase transaction to restock inventory
type Compra struct {
	ID            int     `json:"id"`
	ProdutoID     int     `json:"produto_id"`
	ProdutoNome   string  `json:"produto_nome"`
	Quantidade    int     `json:"quantidade"`
	PrecoUnitario float64 `json:"preco_unitario"`
	Total         float64 `json:"total"`
	DataCompra    string  `json:"data_compra"`
}

// CompraResponse represents the result of a purchase write operation
type CompraResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

// GetCompras returns all purchases from the SQLite database
func (a *App) GetCompras() []Compra {
	if a.db == nil {
		return []Compra{}
	}

	rows, err := a.db.Query("SELECT id, produto_id, produto_nome, quantidade, preco_unitario, total, data_compra FROM compras ORDER BY data_compra DESC")
	if err != nil {
		log.Printf("Erro ao buscar compras: %v", err)
		return []Compra{}
	}
	defer rows.Close()

	var compras []Compra
	for rows.Next() {
		var c Compra
		err := rows.Scan(&c.ID, &c.ProdutoID, &c.ProdutoNome, &c.Quantidade, &c.PrecoUnitario, &c.Total, &c.DataCompra)
		if err != nil {
			log.Printf("Erro ao escanear compra: %v", err)
			continue
		}
		compras = append(compras, c)
	}

	return compras
}

// CreateCompra inserts a new purchase and updates product stock
func (a *App) CreateCompra(compra Compra) CompraResponse {
	if a.db == nil {
		return CompraResponse{Success: false, Message: "Banco de dados não inicializado."}
	}

	if compra.ProdutoNome == "" || compra.Quantidade <= 0 {
		return CompraResponse{
			Success: false,
			Message: "Produto e quantidade são obrigatórios.",
		}
	}

	compra.Total = float64(compra.Quantidade) * compra.PrecoUnitario

	tx, err := a.db.Begin()
	if err != nil {
		log.Printf("Erro ao iniciar transação: %v", err)
		return CompraResponse{Success: false, Message: "Erro ao processar compra."}
	}
	defer tx.Rollback()

	_, err = tx.Exec(
		"INSERT INTO compras (produto_id, produto_nome, quantidade, preco_unitario, total, data_compra) VALUES (?, ?, ?, ?, ?, ?)",
		compra.ProdutoID, compra.ProdutoNome, compra.Quantidade, compra.PrecoUnitario,
		compra.Total, compra.DataCompra,
	)
	if err != nil {
		log.Printf("Erro ao inserir compra: %v", err)
		return CompraResponse{
			Success: false,
			Message: "Erro ao salvar compra no banco de dados.",
		}
	}

	_, err = tx.Exec("UPDATE products SET quantity = quantity + ? WHERE id = ?", compra.Quantidade, compra.ProdutoID)
	if err != nil {
		log.Printf("Erro ao atualizar estoque: %v", err)
		return CompraResponse{Success: false, Message: "Erro ao atualizar estoque."}
	}

	err = tx.Commit()
	if err != nil {
		log.Printf("Erro ao finalizar transação: %v", err)
		return CompraResponse{Success: false, Message: "Erro ao finalizar compra."}
	}

	return CompraResponse{
		Success: true,
		Message: "Compra registrada com sucesso!",
	}
}

