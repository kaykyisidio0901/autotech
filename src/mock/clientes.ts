import type { Cliente, Veiculo } from '../types'

export const mockClientes: Cliente[] = [
  { id: 1, nome: 'Fernando Lima', cpf: '123.456.789-00', rg: '12.345.678-9', telefone: '(11) 98765-4321', whatsapp: '5511987654321', email: 'fernando@email.com', cep: '01234-567', endereco: 'Av. Paulista', numero: '1000', bairro: 'Bela Vista', cidade: 'São Paulo', estado: 'SP' },
  { id: 2, nome: 'Juliana Costa', cpf: '234.567.890-11', rg: '23.456.789-0', telefone: '(11) 97654-3210', whatsapp: '5511976543210', email: 'juliana@email.com', cep: '04567-890', endereco: 'Rua Funchal', numero: '200', bairro: 'Vila Olímpia', cidade: 'São Paulo', estado: 'SP' },
  { id: 3, nome: 'Roberto Alves', cpf: '345.678.901-22', rg: '34.567.890-1', telefone: '(21) 96543-2109', whatsapp: '5521965432109', email: 'roberto@email.com', cep: '22000-000', endereco: 'Av. Atlântica', numero: '500', bairro: 'Copacabana', cidade: 'Rio de Janeiro', estado: 'RJ' },
  { id: 4, nome: 'Camila Rocha', cpf: '456.789.012-33', rg: '45.678.901-2', telefone: '(31) 95432-1098', whatsapp: '5531954321098', email: 'camila@email.com', cep: '30100-000', endereco: 'Rua Bahia', numero: '300', bairro: 'Funcionários', cidade: 'Belo Horizonte', estado: 'MG' },
  { id: 5, nome: 'Diego Martins', cpf: '567.890.123-44', rg: '56.789.012-3', telefone: '(41) 94321-0987', whatsapp: '5541943210987', email: 'diego@email.com', cep: '80000-000', endereco: 'Av. República Argentina', numero: '800', bairro: 'Água Verde', cidade: 'Curitiba', estado: 'PR' },
]

export const mockVeiculos: Veiculo[] = [
  { id: 1, clienteId: 1, placa: 'ABC1D23', marca: 'Volkswagen', modelo: 'Gol GTI', ano: 2020, cor: 'Preto', chassi: '9BWZZZ377VT004251', renavam: '12345678901', combustivel: 'Gasolina', quilometragem: 45000 },
  { id: 2, clienteId: 1, placa: 'EFG4H56', marca: 'Fiat', modelo: 'Uno', ano: 2019, cor: 'Branco', chassi: '9BD12345678901234', renavam: '23456789012', combustivel: 'Flex', quilometragem: 62000 },
  { id: 3, clienteId: 2, placa: 'HIJ7K89', marca: 'Honda', modelo: 'Civic', ano: 2022, cor: 'Prata', chassi: '9BG12345678901234', renavam: '34567890123', combustivel: 'Flex', quilometragem: 28000 },
  { id: 4, clienteId: 3, placa: 'LMN0P12', marca: 'Toyota', modelo: 'Corolla', ano: 2021, cor: 'Azul', chassi: '9BR12345678901234', renavam: '45678901234', combustivel: 'Flex', quilometragem: 35000 },
  { id: 5, clienteId: 4, placa: 'QRS3T45', marca: 'Chevrolet', modelo: 'Onix', ano: 2023, cor: 'Vermelho', chassi: '9BC12345678901234', renavam: '56789012345', combustivel: 'Flex', quilometragem: 12000 },
  { id: 6, clienteId: 5, placa: 'UVW6X78', marca: 'Ford', modelo: 'Ka', ano: 2020, cor: 'Cinza', chassi: '9BF12345678901234', renavam: '67890123456', combustivel: 'Flex', quilometragem: 51000 },
]
