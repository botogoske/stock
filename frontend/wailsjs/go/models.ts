export namespace main {
	
	export class Compra {
	    id: number;
	    produto_id: number;
	    produto_nome: string;
	    quantidade: number;
	    preco_unitario: number;
	    total: number;
	    data_compra: string;
	
	    static createFrom(source: any = {}) {
	        return new Compra(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.produto_id = source["produto_id"];
	        this.produto_nome = source["produto_nome"];
	        this.quantidade = source["quantidade"];
	        this.preco_unitario = source["preco_unitario"];
	        this.total = source["total"];
	        this.data_compra = source["data_compra"];
	    }
	}
	export class CompraResponse {
	    success: boolean;
	    message: string;
	
	    static createFrom(source: any = {}) {
	        return new CompraResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.message = source["message"];
	    }
	}
	export class CreateUserResponse {
	    success: boolean;
	    message: string;
	
	    static createFrom(source: any = {}) {
	        return new CreateUserResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.message = source["message"];
	    }
	}
	export class Customer {
	    id: number;
	    name: string;
	    razao_social: string;
	    cnpj: string;
	    endereco: string;
	    bairro: string;
	    cidade: string;
	    cep: string;
	
	    static createFrom(source: any = {}) {
	        return new Customer(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.razao_social = source["razao_social"];
	        this.cnpj = source["cnpj"];
	        this.endereco = source["endereco"];
	        this.bairro = source["bairro"];
	        this.cidade = source["cidade"];
	        this.cep = source["cep"];
	    }
	}
	export class CustomerResponse {
	    success: boolean;
	    message: string;
	
	    static createFrom(source: any = {}) {
	        return new CustomerResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.message = source["message"];
	    }
	}
	export class LoginResponse {
	    success: boolean;
	    message: string;
	
	    static createFrom(source: any = {}) {
	        return new LoginResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.message = source["message"];
	    }
	}
	export class Product {
	    id: number;
	    name: string;
	    description: string;
	    price: number;
	    category: string;
	    quantity: number;
	    min_stock: number;
	
	    static createFrom(source: any = {}) {
	        return new Product(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.price = source["price"];
	        this.category = source["category"];
	        this.quantity = source["quantity"];
	        this.min_stock = source["min_stock"];
	    }
	}
	export class ProductResponse {
	    success: boolean;
	    message: string;
	
	    static createFrom(source: any = {}) {
	        return new ProductResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.message = source["message"];
	    }
	}
	export class User {
	    username: string;
	    email: string;
	    role: string;
	    password: string;
	
	    static createFrom(source: any = {}) {
	        return new User(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.username = source["username"];
	        this.email = source["email"];
	        this.role = source["role"];
	        this.password = source["password"];
	    }
	}
	export class Venda {
	    id: number;
	    username: string;
	    user_name: string;
	    cliente_id: number;
	    cliente_nome: string;
	    produto_id: number;
	    produto_nome: string;
	    quantidade: number;
	    preco_unitario: number;
	    total: number;
	    data_venda: string;
	
	    static createFrom(source: any = {}) {
	        return new Venda(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.username = source["username"];
	        this.user_name = source["user_name"];
	        this.cliente_id = source["cliente_id"];
	        this.cliente_nome = source["cliente_nome"];
	        this.produto_id = source["produto_id"];
	        this.produto_nome = source["produto_nome"];
	        this.quantidade = source["quantidade"];
	        this.preco_unitario = source["preco_unitario"];
	        this.total = source["total"];
	        this.data_venda = source["data_venda"];
	    }
	}
	export class VendaResponse {
	    success: boolean;
	    message: string;
	
	    static createFrom(source: any = {}) {
	        return new VendaResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.message = source["message"];
	    }
	}

}

