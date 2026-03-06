import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ClienteAddComponent } from './clients-add/clients-add';
import { ClienteEditComponent } from './clients-edit/clients-edit';
import { ClienteDeleteComponent } from './clients-delete/clients-delete';

import { ClienteService, Cliente } from '../../services/client.service';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ClienteAddComponent,
    ClienteEditComponent,
    ClienteDeleteComponent
  ],
  templateUrl: './clients.html',
})
export class ClientsComponent implements OnInit {

  // --- VARIÁVEIS DE DADOS ---
  listaClientes: Cliente[] = [];
  clientesFiltrados = signal<Cliente[]>([]);
  termoBusca: string = '';
  carregando = signal(false);
  erro = signal('');

  // --- CONTROLE DE MODAIS ---
  modalAdicionarAberto: boolean = false;
  modalEditarAberto: boolean = false;
  modalExcluirAberto: boolean = false;

  // --- CLIENTE SELECIONADO ---
  clienteSelecionado: Cliente | null = null;

  // Injetando o novo ClienteService
  constructor(private clienteService: ClienteService) { }

  ngOnInit(): void {
    this.carregarClientes();
  }

  // --- 1. CARREGAR DADOS ---
  carregarClientes(): void {
    this.carregando.set(true);
    this.erro.set('');

    // Agora usamos o listar() do ClienteService
    this.clienteService.listar(0, 100).subscribe({
      next: (clientes: Cliente[]) => {
        // Como usamos o pipe(map) no serviço, já recebemos a array direto aqui!
        this.listaClientes = clientes;
        this.filtrarClientes();
        this.carregando.set(false);
      },
      error: (err: any) => {
        console.error('Erro ao buscar clientes:', err);
        this.erro.set('Erro ao carregar clientes.');
        this.carregando.set(false);
      }
    });
  }

  // --- 2. FILTRO DE BUSCA ---
  filtrarClientes() {
    if (!this.termoBusca.trim()) {
      this.clientesFiltrados.set([...this.listaClientes]);
    } else {
      const termo = this.termoBusca.toLowerCase();
      this.clientesFiltrados.set(
        this.listaClientes.filter(c =>
          c.name.toLowerCase().includes(termo) ||
          c.email.toLowerCase().includes(termo) ||
          c.cpf.toLowerCase().includes(termo)
        )
      );
    }
  }

  // --- 3. LÓGICA DO MODAL ADICIONAR ---
  abrirModalAdicionar() {
    this.modalAdicionarAberto = true;
  }

  fecharModalAdicionar(sucesso: boolean) {
    this.modalAdicionarAberto = false;
    if (sucesso) {
      this.carregarClientes(); // Recarrega a lista se adicionou com sucesso
    }
  }

  // --- 4. LÓGICA DO MODAL EDITAR ---
  abrirModalEditar(cliente: Cliente) {
    this.clienteSelecionado = { ...cliente };
    this.modalEditarAberto = true;
  }

  fecharModalEditar(sucesso: boolean) {
    this.modalEditarAberto = false;
    this.clienteSelecionado = null;
    if (sucesso) {
      this.carregarClientes(); // Recarrega a lista se editou com sucesso
    }
  }

  // --- 5. LÓGICA DO MODAL EXCLUIR ---
  abrirModalExcluir(cliente: Cliente) {
    this.clienteSelecionado = cliente;
    this.modalExcluirAberto = true;
  }

  fecharModalExcluir(sucesso: boolean) {
    this.modalExcluirAberto = false;
    this.clienteSelecionado = null;
    if (sucesso) {
      this.carregarClientes(); // Recarrega a lista se excluiu com sucesso
    }
  }
}
