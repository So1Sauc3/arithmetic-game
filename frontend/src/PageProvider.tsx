import React, { createContext, useContext, useState } from "react";
import type { CorrectSubmission, LobbyHello, NewPlayer, NewQuestion, Player, PurchaseConfirmed, Socket, StatusChanged, StatusEffectId, OpponentStatusChanged, OpponentEliminated, MultipliersChanged} from './lib/comm.ts';
import { connect as socketConnect } from './lib/comm.ts';

export const enum CurrentPage {
  Login,
  Lobby,
  Game,
}

type PlayerMap = { [key: number]: Player }

type PageContextType = {
  page: CurrentPage;
  setPage: React.Dispatch<React.SetStateAction<CurrentPage>>;
  socket: Socket;
  connectSocket: (name: string) => Promise<void>;
  question: NewQuestion;
  setQuestion: React.Dispatch<React.SetStateAction<NewQuestion>>;
  players: PlayerMap;
  setPlayers: React.Dispatch<React.SetStateAction<PlayerMap>>;
  score: number;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  coins: number;
  setCoins: React.Dispatch<React.SetStateAction<number>>;
  statusEffects: StatusEffectId[]
  setStatusEffects: React.Dispatch<React.SetStateAction<StatusEffectId[]>>;
  scoreMultiplier: number;
  setScoreMultiplier: React.Dispatch<React.SetStateAction<number>>;
  coinMultiplier: number;
  setCoinMultiplier: React.Dispatch<React.SetStateAction<number>>;
};

const PageContext = createContext<PageContextType | undefined>(undefined);

function connect(
    setSocket: React.Dispatch<React.SetStateAction<Socket>>,
    setQuestion: React.Dispatch<React.SetStateAction<NewQuestion>>,
    setPlayers: React.Dispatch<React.SetStateAction<PlayerMap>>,
    setScore: React.Dispatch<React.SetStateAction<number>>,
    setCoins: React.Dispatch<React.SetStateAction<number>>,
    setStatusEffects: React.Dispatch<React.SetStateAction<StatusEffectId[]>>,
    setScoreMultiplier: React.Dispatch<React.SetStateAction<number>>,
    setCoinMultiplier: React.Dispatch<React.SetStateAction<number>>,
    setPage: React.Dispatch<React.SetStateAction<CurrentPage>>,
): (name: string) => Promise<void> {
    return async (name: string) => {
        const socket = await socketConnect(name);
        socket.onHubHello((_) => {});
        socket.onLobbyHello((m: LobbyHello) => {
            setPlayers((pm) => m.players.reduce<PlayerMap>(
                (a, c) => {
                    return { [c.id]: c, ...a }
                },
                pm
            ));
        });
        socket.onNewPlayer((m: NewPlayer) => {
            setPlayers((i) => {
                return { [m.id]: m as Player, ...i }
            })
        })
        socket.onCorrectSubmission((m: CorrectSubmission) => {
            setCoins(m.coins); setScore(m.score)
        });
        socket.onNewQuestion((m: NewQuestion) => {
            setQuestion(m)
            setPage(CurrentPage.Game)
        });
        socket.onPurchaseConfirmed((m: PurchaseConfirmed) => {
            setCoins(m.coins)
        })
        socket.onStatusChanged((m: StatusChanged) => {
            setStatusEffects(m.effects)
        })
        socket.onOpponentStatusChanged((m: OpponentStatusChanged) => {
            setPlayers((i) => {
                i[m.playerId].statusEffects = m.effects;
                return i;
            })
        })
        socket.onEliminated((_) => {});
        socket.onOpponentEliminated((m: OpponentEliminated) => {
            setPlayers((i) => {
                i[m.playerId].eliminated = true;
                return i;
            })
        });
        socket.onOpponentStatusChanged((m: OpponentStatusChanged) => {
            setPlayers((i) => {
                i[m.playerId].statusEffects = m.effects;
                return i;
            })
        })
        socket.onMultipliersChanged((m: MultipliersChanged) => {
            setScoreMultiplier(m.scoreMultiplier);
            setCoinMultiplier(m.coinMultiplier);
        })
        console.log(socket);
        socket.socket.addEventListener('open', (_) => socket.sendSubmit(0));
        setSocket(socket);
    }
}

export function PageProvider({ children }: { children: React.ReactNode }) {
  const [page, setPage] = useState(CurrentPage.Login);
  const [socket, setSocket] = useState(null as any);
  const [question, setQuestion] = useState({} as NewQuestion);
  const [players, setPlayers] = useState({} as PlayerMap);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [statusEffects, setStatusEffects] = useState([] as StatusEffectId[])
  const [scoreMultiplier, setScoreMultiplier] = useState(1);
  const [coinMultiplier, setCoinMultiplier] = useState(1);
  return (
    <PageContext.Provider value={{
        page, setPage,
        socket, connectSocket: connect(setSocket, setQuestion, setPlayers, setScore, setCoins, setStatusEffects, setScoreMultiplier, setCoinMultiplier, setPage),
        question, setQuestion,
        players, setPlayers,
        score, setScore,
        coins, setCoins,
        statusEffects, setStatusEffects,
        scoreMultiplier, setScoreMultiplier,
        coinMultiplier, setCoinMultiplier,
    }}>
      {children}
    </PageContext.Provider>
  );
}

export function usePage() {
  const ctx = useContext(PageContext);
  if (!ctx) throw new Error("usePage must be used within PageProvider");
  return ctx;
}
