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
        let novaTentativa;
        const agendarReconexao = () => {
            if (!ativo || novaTentativa) return;
            setStatus("desconectado");
            // O SignalR não repete start() nem reinicia após esgotar a reconexão.
            novaTentativa = setTimeout(() => {
                if (ativo) setTentativa((valor) => valor + 1);
            }, 3000);
        };
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
                agendarReconexao();
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
            agendarReconexao();
        });

        const iniciar = async () => {
            try {
                await conexao.start();
                if (ativo) {
                    await entrar();
                } else {
                    await conexao.stop();
                }
            } catch (erro) {
                if (ativo) {
                    console.error("Falha ao conectar às mensagens em tempo real:", erro);
                    agendarReconexao();
                }
            }
        };
        iniciar();

        return () => {
            ativo = false;
            clearTimeout(novaTentativa);
            conexao.off("MensagensAtualizadas", receberMensagens);
            // Encerrar a conexão também remove a inscrição no grupo anterior.
            conexao.stop().catch((erro) => console.error("Falha ao encerrar conexão:", erro));
        };
    }, [idAtendimento, tentativa]);

    return { status, reconectar: () => setTentativa((valor) => valor + 1) };
}
