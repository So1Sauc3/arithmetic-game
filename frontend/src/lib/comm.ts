export const Powerup = {
    CoinMultiplier: 0,
    ScoreMultiplier: 1,
    SkipQuestion: 2,
    EasyMode: 3,
    DoubleTap: 4,
    CoinLeak: 5,
    HardMode: 6,
} as const;

export type PowerupId = typeof Powerup[keyof typeof Powerup]

export const StatusEffect = {
    DoubleTap: 0,
    CoinLeak: 1,
    HardMode: 2,
} as const;

export type StatusEffectId = typeof StatusEffect[keyof typeof StatusEffect]

export const ClientOp = {
    Register: 0,
    Submit: 1,
    Purchase: 2,
} as const

export type RegisterMessage = {
    opcode: typeof ClientOp.Register;
    name: string
}

export type SubmitMessage = {
    opcode: typeof ClientOp.Submit;
    answer: number
}

export type PurchaseMessage = {
    opcode: typeof ClientOp.Purchase;
    powerup: PowerupId
    targetId: number
}

export type ClientMessage = RegisterMessage | SubmitMessage | PurchaseMessage;

export const ServerOp = {
    HubHello: 0,
    LobbyHello: 1,
    NewPlayer: 2,
    CorrectSubmission: 3,
    NewQuestion: 4,
    PurchaseConfirmed: 5,
    StatusChanged: 6,
    OpponentStatusChanged: 7,
    Eliminated: 8,
    OpponentEliminated: 9,
    OpponentScoreChanged: 10,
    MultipliersChanged: 11,
} as const

export type Player = {
    id: number
    name: string
    statusEffects: StatusEffectId[]
    eliminated: boolean
}

export type HubHello = {
    opcode: typeof ServerOp.HubHello;
}

export type LobbyHello = {
    opcode: typeof ServerOp.LobbyHello;
    players: Player[]
};

export type NewPlayer = {
    opcode: typeof ServerOp.NewPlayer;
} & Player;

export type CorrectSubmission = {
    opcode: typeof ServerOp.CorrectSubmission
    score: number
    coins: number
}

export type NewQuestion = {
    opcode: typeof ServerOp.NewQuestion
    difficulty: number
    question: string
}

export type PurchaseConfirmed = {
    opcode: typeof ServerOp.PurchaseConfirmed
    coins: number
}

export type StatusChanged = {
    opcode: typeof ServerOp.StatusChanged
    effects: StatusEffectId[]
}

export type OpponentStatusChanged = {
    opcode: typeof ServerOp.OpponentStatusChanged
    playerId: number
    effects: StatusEffectId[]
}

export type Eliminated = {
    opcode: typeof ServerOp.Eliminated
    place: number
}

export type OpponentEliminated = {
    opcode: typeof ServerOp.OpponentEliminated
    playerId: number
}

export type OpponentScoreChanged = {
    opcode: typeof ServerOp.OpponentScoreChanged
    playerId: number
    score: number
}

export type MultipliersChanged = {
    opcode: typeof ServerOp.MultipliersChanged
    scoreMultiplier: number
    coinMultiplier: number
}

export type ServerMessage = HubHello | LobbyHello
    | NewPlayer | CorrectSubmission
    | NewQuestion | PurchaseConfirmed
    | StatusChanged | OpponentStatusChanged
    | Eliminated | OpponentEliminated
    | OpponentScoreChanged | MultipliersChanged;

const textDecoder = new TextDecoder('utf-8');
const textEncoder = new TextEncoder();

function serializeClientMessage(payload: ClientMessage): ArrayBuffer {
    let buffer, view;
    const { opcode } = payload;
    switch (opcode) {
        case 0: // Register
            // payload: { opcode: 0, name: string }
            const nameEncoded = textEncoder.encode(payload.name);
            if (nameEncoded.length > 255) throw new Error("Name too long");
            buffer = new ArrayBuffer(1 + 1 + nameEncoded.length); // opcode + nameLen + name
            view = new DataView(buffer);
            view.setUint8(0, opcode);
            view.setUint8(1, nameEncoded.length);
            for (let i = 0; i < nameEncoded.length; i++) {
                view.setUint8(2 + i, nameEncoded[i]);
            }
            return buffer;

        case 1: // Submission
            // payload: { opcode: 1, answer: number }
            buffer = new ArrayBuffer(1 + 4); // opcode + answer
            view = new DataView(buffer);
            view.setUint8(0, opcode);
            view.setInt32(1, payload.answer, false); // big endian
            return buffer;

        case 2: // Powerup purchase
            // payload: { opcode: 2, powerupId: number, affectedPlayerId: number }
            buffer = new ArrayBuffer(1 + 1 + 1); // opcode + powerupId + affectedPlayerId
            view = new DataView(buffer);
            view.setUint8(0, opcode);
            view.setUint8(1, payload.powerup);
            view.setUint8(2, payload.targetId);
            return buffer;

        default:
            throw new Error("Unknown opcode: " + opcode);
    }
}

// Helper: parses a player from a DataView at the given offset
function parsePlayer(view: DataView, offset: number): [Player, number] {
    const playerId = view.getUint8(offset++);
    const nameLen = view.getUint8(offset++);
    const nameBytes = new Uint8Array(view.buffer, view.byteOffset + offset, nameLen);
    const name = textDecoder.decode(nameBytes);
    offset += nameLen;
    return [{ id: playerId, name, statusEffects: [], eliminated: false }, offset];
}

// Helper: parses status effect IDs
function parseStatusEffects(view: DataView, count: number, offset: number): [StatusEffectId[], number] {
    const arr = [];
    for (let i = 0; i < count; i++) {
        arr.push(view.getUint16(offset, false)); // big-endian
        offset += 2;
    }
    return [arr as StatusEffectId[], offset];
}

function parseServerMessage(buffer: ArrayBuffer): ServerMessage {
    const view = new DataView(buffer);
    let offset = 0;

    const opcode = view.getUint8(offset++);

    switch (opcode) {
        case 0: // Hub Greeting
            // No content
            return { opcode } ;

        case 1: // Lobby Greeting
            {
                const numPlayers = view.getUint8(offset++);
                const players = [];
                for (let i = 0; i < numPlayers; i++) {
                    let parsed;
                    [parsed, offset] = parsePlayer(view, offset);
                    players.push(parsed);
                }
                return { players, opcode };
            }

        case 2: // New Registered Player
            {
                let player;
                [player, offset] = parsePlayer(view, offset);
                return { ...player, opcode };
            }

        case 3: // Correct Submission
            {
                const score = view.getUint32(offset, false); // big-endian
                offset += 4;
                const coins = view.getUint32(offset, false); // big-endian
                offset += 4;
                return { score, coins, opcode };
            }

        case 4: // New Question
            {
                const difficulty = view.getUint8(offset++);
                const questionLength = view.getUint16(offset, false); // big-endian
                offset += 2;
                const qBytes = new Uint8Array(view.buffer, view.byteOffset + offset, questionLength);
                const question = textDecoder.decode(qBytes);
                offset += questionLength;
                return { difficulty, question, opcode };
            }

        case 5: // Purchase Confirmed
            {
                const coins = view.getUint32(offset, false); // big-endian
                offset += 4;
                return { coins, opcode };
            }

        case 6: // Status Changed
            {
                const effectCount = view.getUint16(offset, false); // big-endian
                offset += 2;
                let effects;
                [effects, offset] = parseStatusEffects(view, effectCount, offset);
                return { effects, opcode };
            }

        case 7: // Other Player Status Changed
            {
                const playerId = view.getUint8(offset++);
                const effectCount = view.getUint16(offset, false); // big-endian
                offset += 2;
                let effects;
                [effects, offset] = parseStatusEffects(view, effectCount, offset);
                return { playerId, effects, opcode };
            }

        case 8: // Eliminated
            {
                const place = view.getUint8(offset++);
                return { place, opcode };
            }

        case 9: // Opponent Eliminated
            {
                const playerId = view.getUint8(offset++);
                return { opcode, playerId } ;
            }

        case 10: // Opponent Score Changed
            {
                const playerId = view.getUint8(offset++);
                const score = view.getUint32(offset, false)
                offset += 4;
                return { opcode, playerId, score } ;
            }

        case 11: // Multipliers Changed
            {
                const scoreMultiplier = view.getFloat32(offset, false)
                offset += 4;
                const coinMultiplier = view.getFloat32(offset, false)
                offset += 4;
                return { opcode, scoreMultiplier, coinMultiplier } ;
            }

        default:
            throw new Error('Unknown opcode: ' + opcode);
    }
}

/*
// Example usage:
ws.onmessage = function(e) {
    const msg = parseServerMessage(e.data); // e.data is ArrayBuffer
    console.log(msg);
    // ... process msg
};
*/

export type Socket = {
    socket: WebSocket
    lowlevel: {
        onMessage: (arg0: (arg0: ServerMessage) => void) => void
        send: (arg0: ClientMessage) => void
    }
    onHubHello: (arg0: (arg0: HubHello) => void) => void,
    onLobbyHello: (arg0: (arg0: LobbyHello) => void) => void,
    onNewPlayer: (arg0: (arg0: NewPlayer) => void) => void,
    onCorrectSubmission: (arg0: (arg0: CorrectSubmission) => void) => void,
    onNewQuestion: (arg0: (arg0: NewQuestion) => void) => void,
    onPurchaseConfirmed: (arg0: (arg0: PurchaseConfirmed) => void) => void,
    onStatusChanged: (arg0: (arg0: StatusChanged) => void) => void,
    onOpponentStatusChanged: (arg0: (arg0: OpponentStatusChanged) => void) => void,
    onEliminated: (arg0: (arg0: Eliminated) => void) => void,
    onOpponentEliminated: (arg0: (arg0: OpponentEliminated) => void) => void,
    onMultipliersChanged: (arg0: (arg0: MultipliersChanged) => void) => void,
    sendSubmit: (answer: number) => void
    sendPurchase: (powerup: PowerupId, target: number) => void
}

async function connect_raw(url: string): Promise<Socket> {
    const socket = new WebSocket(url);
    socket.binaryType = "arraybuffer";

    socket.addEventListener("message", (event) => {
        console.log(parseServerMessage(event.data));
    });

    function callIfOpCode<T extends ServerMessage>(handler: (arg0: T) => void, code: typeof ServerOp[keyof typeof ServerOp]) {
        socket.addEventListener("message", (event: MessageEvent<any>) => {
            const message = parseServerMessage(event.data);
            if (message.opcode != code)
                return
            handler(message as T)
        })
    }

    return {
        socket,
        lowlevel: {
            onMessage: (handler: (arg0: ServerMessage) => void) => {
                socket.addEventListener("message", (event: MessageEvent<any>) => handler(parseServerMessage(event.data)))
            },
            send: (message: ClientMessage) => {
                socket.send(serializeClientMessage(message))
            },
        },
        onHubHello: (handler: (arg0: HubHello) => void) => callIfOpCode(handler, ServerOp.HubHello),
        onLobbyHello: (handler: (arg0: LobbyHello) => void) => callIfOpCode(handler, ServerOp.LobbyHello),
        onNewPlayer: (handler: (arg0: NewPlayer) => void) => callIfOpCode(handler, ServerOp.NewPlayer),
        onCorrectSubmission: (handler: (arg0: CorrectSubmission) => void) => callIfOpCode(handler, ServerOp.CorrectSubmission),
        onNewQuestion: (handler: (arg0: NewQuestion) => void) => callIfOpCode(handler, ServerOp.NewQuestion),
        onPurchaseConfirmed: (handler: (arg0: PurchaseConfirmed) => void) => callIfOpCode(handler, ServerOp.PurchaseConfirmed),
        onStatusChanged: (handler: (arg0: StatusChanged) => void) => callIfOpCode(handler, ServerOp.StatusChanged),
        onOpponentStatusChanged: (handler: (arg0: OpponentStatusChanged) => void) => callIfOpCode(handler, ServerOp.OpponentStatusChanged),
        onEliminated: (handler: (arg0: Eliminated) => void) => callIfOpCode(handler, ServerOp.Eliminated),
        onOpponentEliminated: (handler: (arg0: OpponentEliminated) => void) => callIfOpCode(handler, ServerOp.OpponentEliminated),
        onMultipliersChanged: (handler: (arg0: MultipliersChanged) => void) => callIfOpCode(handler, ServerOp.MultipliersChanged),
        sendSubmit: (answer: number) => { socket.send(serializeClientMessage({ opcode: ClientOp.Submit, answer })) },
        sendPurchase: (powerup: PowerupId, targetId: number) => { socket.send(serializeClientMessage({ opcode: ClientOp.Purchase, powerup, targetId })) },
    };
}

export async function connect(name: string): Promise<Socket> {
    // const proto = (window.location.protocol == "http:") ? "ws://" : "wss://"
    // return await connect_raw(`${proto}${window.location.host}/ws\?name=${name}`)
    return await connect_raw("ws://127.0.0.1:8080/ws?name=" + name)
}
