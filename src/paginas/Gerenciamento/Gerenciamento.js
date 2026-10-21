import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sidebar } from "../../componentes/Sidebar/Sidebar";
import { Topbar } from "../../componentes/Topbar/Topbar";
import AtendimentoAPI from "../../service/atendimentoAPI";
import { Button, Table } from "react-bootstrap";
import "./Gerenciamento.css";

export function Gerenciamento() {
    const [atendimentos, setAtendimentos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const { state } = useLocation();
    const navigate = useNavigate();
    const nomeAtendente = state?.nomeAtendente || sessionStorage.getItem("nomeAtendente") || "Atendente";

    useEffect(() => {
        let ativo = true;

        const carregarAtendimentos = async () => {
            setCarregando(true);
            try {
                const resposta = await AtendimentoAPI.listarPorStatusAsync("aguardando");
                const lista = Array.isArray(resposta)
                    ? resposta
                    : resposta?.atendimentos ?? resposta?.Atendimentos ?? resposta?.data ?? [];
                if (ativo) setAtendimentos(Array.isArray(lista) ? lista : []);
            } catch (error) {
                console.error("Erro ao carregar atendimentos aguardando:", error);
                if (ativo) setErro("Não foi possível carregar os atendimentos aguardando.");
            } finally {
                if (ativo) setCarregando(false);
            }
        };

        carregarAtendimentos();
        return () => { ativo = false; };
    }, []);

    const iniciarAtendimento = (atendimento) => {
        const idAtendimento = atendimento.idAtendimento ?? atendimento.IdAtendimento ?? atendimento.id ?? atendimento.Id;
        const nomeCliente = atendimento.nomeCliente ?? atendimento.NomeCliente ?? atendimento.nome ?? atendimento.Nome ?? "";

        if (idAtendimento == null) {
            setErro("Um atendimento retornado pela API não possui idAtendimento.");
            return;
        }

        navigate(`/mensagem/${idAtendimento}`, {
            state: { nomeCliente, nomeAtendente, tipoRemetente: "atendente" }
        });
    };

    return (
        <Sidebar>
            <Topbar>
                <main className="gerenciamento_conteudo">
                    <header className="gerenciamento_cabecalho">
                        <div>
                            <h2>Gerenciamento de atendimentos</h2>
                            <p>Bem-vindo(a), {nomeAtendente}!</p>
                        </div>
                        <Button variant="outline-primary" onClick={() => window.location.reload()}>
                            Atualizar lista
                        </Button>
                    </header>

                    {erro && <p role="alert" className="text-danger">{erro}</p>}
                    <Table responsive striped bordered hover>
                        <thead>
                            <tr>
                                <th>Nº atendimento</th>
                                <th>Cliente</th>
                                <th>Email</th>
                                <th>Assunto</th>
                                <th>Ação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {carregando && <tr><td colSpan={5}>Carregando atendimentos...</td></tr>}
                            {!carregando && !erro && atendimentos.length === 0 && (
                                <tr><td colSpan={5}>Nenhum atendimento aguardando.</td></tr>
                            )}
                            {!carregando && atendimentos.map((atendimento, index) => {
                                const id = atendimento.idAtendimento ?? atendimento.IdAtendimento ?? atendimento.id ?? atendimento.Id;
                                const nome = atendimento.nomeCliente ?? atendimento.NomeCliente ?? atendimento.nome ?? atendimento.Nome ?? "—";
                                return (
                                    <tr key={id ?? index}>
                                        <td>{id ?? "—"}</td>
                                        <td>{nome}</td>
                                        <td>{atendimento.emailCliente ?? atendimento.EmailCliente ?? atendimento.email ?? atendimento.Email ?? "—"}</td>
                                        <td>{atendimento.assunto ?? atendimento.Assunto ?? "—"}</td>
                                        <td>
                                            <Button
                                                variant="primary"
                                                disabled={id == null}
                                                onClick={() => iniciarAtendimento(atendimento)}
                                            >
                                                Começar atendimento
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </main>
            </Topbar>
        </Sidebar>
    );
}