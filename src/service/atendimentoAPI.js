import { HTTPClient } from "./client";

const AtendimentoAPI = {

    async obterAsync(usuarioId){
        try{
            const response = await HTTPClient.get(`/Usuario/Obter/${usuarioId}`);
            return response.data;
        } catch(error) {
            console.error("Erro ao obter usuário:", error);
            throw error;
        }
    },



    async listarAsync(ativo) {
        try {
            //http://localhost:5276/Usuario/Listar?ativos=true
            const response = await HTTPClient.get(`/Usuario/Listar?ativos=${ativo}`);
            return response.data;
        } catch(error) {
            console.error("Erro ao listar usuário:", error);
            throw error;
        }
    },
    async listarPorStatusAsync(status) {
        try {
            const response = await HTTPClient.get(
                `/Atendimento/ListarPorStatus?status=${encodeURIComponent(status)}`
            );
            return response.data;
        } catch(error) {
            console.error("Erro ao listar atendimentos por status:", error);
            throw error;
        }
    },
    async iniciarAsync(idAtendimento, funcionarioId) {
        try {
            const response = await HTTPClient.put(
                `/Atendimento/Iniciar/${idAtendimento}`,
                { funcionarioID: funcionarioId }
            );
            return response.data;
        } catch(error) {
            console.error("Erro ao iniciar atendimento:", error);
            throw error;
        }
    },
    async finalizarAsync(idAtendimento) {
        try {
            const response = await HTTPClient.put(`/Atendimento/Finalizar/${idAtendimento}`);
            return response.data;
        } catch(error) {
            console.error("Erro ao finalizar atendimento:", error);
            throw error;
        }
    },
    async criarAsync(nomeCliente, emailCliente, celular, assunto) {
        try {
            const atendimentoCriar = {
                nomeCliente,
                emailCliente,
                celular,
                assunto
            };
    
            const response = await HTTPClient.post("/Atendimento/Criar", atendimentoCriar);
            return response.data;
    
        } catch(error) {
            console.error("Erro ao criar Atendimento:", error);
            throw error;
        }
    },
    
    async atualizarAsync(id, nome, email, tipoUsuarioId) {
        try {
            const usuarioAtualizar = {
                Id: id,
                Nome: nome,
                Email: email,
                TipoUsuario: tipoUsuarioId
            };
    
            const response = await HTTPClient.put("/Usuario/Atualizar", usuarioAtualizar);
            return response.data;
    
        } catch(error) {
            console.error("Erro ao atualizar Usuario:", error);
            throw error;
        }
    },
    async deletarAsync(usuarioId){
        try{
            const response = await HTTPClient.delete(`/Usuario/Deletar/${usuarioId}`);
            return response.data;
        } catch(error) {
            console.error("Erro ao deletar Usuario:", error );
            throw error;
        }
    },
    
    async listarTiposUsuarioAsync(){
        try{
            const response = await HTTPClient.get("/Usuario/ListarTiposUsuario");
            return response.data;
        } catch(error) {
            console.error("Erro ao listar tipos Usuario:", error );
            throw error;
        }
    },
    
    async atualizarSenhaAsync(id, senha, senhaAntiga) {
        try {
    
            const usuarioAtualizarSenha = {
                Id: id, 
                Senha: senha,
                SenhaAntiga: senhaAntiga
            };
    
            const response = await HTTPClient.put("/Usuario/Atualizar", usuarioAtualizarSenha);
    
            return response.data;
    
        } catch(error) {
            console.error("Erro ao atualizar senha:", error );
            throw error;
        }
    },
    
    async restaurarAsync(usuarioId) {
        try {
    
            const response = await HTTPClient.put(`/Usuario/Restaurar/${usuarioId}`);
    
            return response.data;
    
        } catch(error) {
            console.error("Erro ao Restaurar Usuario:", error );
            throw error;
        }
    }

}

export default AtendimentoAPI;