import { useEffect, useRef, useState } from "react";
import { HubConnectionBuilder } from "@microsoft/signalr";
import { HTTPClient } from "../service/client";

export function useMensagensTempoReal(idAtendimento, atualizarMensagens) {
    const [status, setStatus] = useState("conectando");
    const [tentativa, setTentativa] = useState(0);
    const atualizarRef = useRef(atualizarMensagens);
    atualizarRef.current = atualizarMensagens;

    useEffect(() => {
        let ativo = true;
        const conexao = new HubConnectionBuilder()
            .withUrl(`${HTTPClient.defaults.baseURL}/hubs/mensagens`, { withCredentials: true })
            .withAutomaticReconnect()
            .build();

        setStatus("conectando");
        const receberMensagens = (id, mensagens) => {
            if (ativo && String(id) === String(idAtendimento)) {
                atualizarRef.current(mensagens);
            }
        };
        const entrar = async () => {
            try {
                await conexao.invoke("EntrarAtendimento", Number(idAtendimento));
                if (ativo) setStatus("conectado");
            } catch (erro) {
                console.error("Falha ao entrar no atendimento:", erro);
                if (ativo) setStatus("desconectado");
            }
        };

        conexao.on("MensagensAtualizadas", receberMensagens);
        conexao.onreconnecting(() => {
            if (ativo) setStatus("reconectando");
        });
        conexao.onreconnected(async () => {
            if (ativo) await entrar();
        });
        conexao.onclose(() => {
            if (ativo) setStatus("desconectado");
        });

        const iniciar = async () => {
            try {
                await conexao.start();
                if (ativo) await entrar();
            } catch (erro) {
                if (ativo) {
                    console.error("Falha ao conectar às mensagens em tempo real:", erro);
                    setStatus("desconectado");
                }
            }
        };
        iniciar();

        return () => {
            ativo = false;
            conexao.off("MensagensAtualizadas", receberMensagens);
            // Encerrar a conexão também remove a inscrição no grupo anterior.
            conexao.stop().catch((erro) => console.error("Falha ao encerrar conexão:", erro));
        };
    }, [idAtendimento, tentativa]);

    return { status, reconectar: () => setTentativa((valor) => valor + 1) };
}
