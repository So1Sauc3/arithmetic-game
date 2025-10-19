"use client";

import AnimatedList from "@/components/AnimatedList";
import TextType from "@/components/TextType";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import StatisticsItem from "@/components/StatisticsItem";
import AbilityCard from "@/components/AbilityCard";
import Plate from "@/components/Plate";

type Ability = { id: string; name: string; image?: string };

function generateEquation() {
    const a = Math.floor(Math.random() * 12) + 1;
    const b = Math.floor(Math.random() * 12) + 1;
    const op = ['+', '-', '*'][Math.floor(Math.random() * 3)];
    const expr = `${a} ${op} ${b} = `;
    // eslint-disable-next-line no-eval
    // safe-ish for small ints
    const answer = 0;
    return { expr, answer } as { expr: string; answer: number };
}

export default function Game() {
    const [equation, setEquation] = useState<string>("0 + 0");
    const [answer, setAnswer] = useState<number>(0);
    const [inputValue, setInputValue] = useState<string>("");
    // Track focus for TextType input
    const [isInputActive, setIsInputActive] = useState<boolean>(true);
    const [score, setScore] = useState<number>(0);
    const [coin, setCoin] = useState<number>(0);
        const [difficulty, setDifficulty] = useState<number>(1);
    const [timer, setTimer] = useState<number>(60);

        // 10 abilities, keys QWERTYUIOP
        const keymap = 'QWERTYUIOP'.split('');
        const [abilities] = useState<Ability[]>(
            Array.from({ length: 10 }).map((_, i) => ({ id: `a${i + 1}`, name: `Ability ${i + 1}`, image: undefined }))
        );

        // costs assigned to each ability
        const abilityCosts = useMemo(() => abilities.map((_, i) => 1 + i * 2), [abilities]);

        const abilityRefs = useRef<Array<HTMLDivElement | null>>(Array(10).fill(null));
        const inputWrapperRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const { expr, answer } = generateEquation();
        setEquation(expr);
        setAnswer(answer);
    }, []);

    useEffect(() => {
        const id = setInterval(() => {
            setTimer(t => Math.max(0, t - 1));
        }, 1000);
        return () => clearInterval(id);
    }, []);

    const submit = useCallback(() => {
        if (inputValue.trim() === "") return;
        const val = Number(inputValue.trim());
        if (!Number.isFinite(val)) return;

        // animate input wrapper for feedback (down and up)
        if (inputWrapperRef.current && typeof inputWrapperRef.current.animate === 'function') {
            inputWrapperRef.current.animate([
                { transform: 'translateY(0)' },
                { transform: 'translateY(4px)' },
                { transform: 'translateY(0)' }
            ], { duration: 180, easing: 'ease-in-out' });
        }

        if (Math.abs(val - answer) < 0.0001) {
            setScore(s => s + 10 * difficulty);
            setCoin(c => c + 1);
            // new equation
            const { expr, answer: a } = generateEquation();
            setEquation(expr);
            setAnswer(a);
        } else {
            // penalize
            setScore(s => Math.max(0, s - 2));
        }

        // clear input regardless of correctness
        setInputValue("");
    }, [inputValue, answer, difficulty]);

    // Listen for key events and update inputValue (only numbers)
    useEffect(() => {
        if (!isInputActive) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                submit();
                return;
            }
            if (e.key === 'Backspace') {
                setInputValue((v) => v.slice(0, -1));
                return;
            }
            if (/^[0-9]$/.test(e.key)) {
                setInputValue((v) => v.length < 6 ? v + e.key : v); // max 6 digits
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isInputActive, submit]);

        useEffect(() => {
            // bump difficulty every 100 points
            setDifficulty(Math.max(1, Math.floor(score / 100) + 1));
        }, [score]);

    // No longer needed: onKeyDown for Input

    const scoreboardItems = useMemo(() => {
        return Array.from({ length: 20 }, (_, i) => `Player ${i + 1} — ${Math.max(0, 100 - i * 3)}`);
    }, []);

    // attempt to buy & use an ability by index
    const attemptBuy = (index: number) => {
        const cost = abilityCosts[index] ?? 0;
        const el = abilityRefs.current[index];
        if (coin >= cost) {
            // success: deduct coins and apply effect
            setCoin(c => c - cost);
            setScore(s => s + 5 + index);
            if (el && typeof el.animate === 'function') {
                el.animate([
                    { transform: 'translateY(0)' },
                    { transform: 'translateY(4px)' },
                    { transform: 'translateY(0)' }
                ], { duration: 180, easing: 'ease-in-out' });
            }
        } else {
            // failure: shake
            if (el && typeof el.animate === 'function') {
                el.animate([
                    { transform: 'translateX(0)' },
                    { transform: 'translateX(-6px)' },
                    { transform: 'translateX(6px)' },
                    { transform: 'translateX(0)' }
                ], { duration: 240, easing: 'ease-in-out' });
            }
        }
    };

    useEffect(() => {
        const handle = (e: KeyboardEvent) => {
            const key = e.key.toUpperCase();
            const idx = keymap.indexOf(key);
            if (idx >= 0) {
                e.preventDefault();
                attemptBuy(idx);
            }
        };
        window.addEventListener('keydown', handle);
        return () => window.removeEventListener('keydown', handle);
    }, [abilityCosts, coin, keymap]);

    return (
        // <Plate className="" pathDataTemplate="M 0 0 H width V height H 0 Z">

        // </Plate>
        <div className="w-screen h-screen relative overflow-hidden text-[#E8D8A1]">
            <div className="max-w-[300px] w-full h-full inline-flex flex-col left-0 top-0 absolute ">
                <Plate className="w-full h-16 left-0 right-0 p-2 flex mb-2 bg-[#000A2233]" pathDataTemplate="M 8 0 H width-L1 h 56 l 8 8 V height-L1 v 56 l -8 8 H ts h -56 l -8 -8 V 8 l 8 -8 Z">
                    <h4 className="w-full text-4xl font-parismatch text-[#E8D8A1] mb-2">Scoreboard</h4>
                </Plate>
                <Plate className="w-full h-full absolute flex left-0 right-0 bg-[#000A2233]" pathDataTemplate="M 8 0 H width-L1 h 56 l 8 8 V height-L1 v 56 l -8 8 H ts h -56 l -8 -8 V 8 l 8 -8 Z">
                    <div className="w-full h-full left-0 top-0 absolute">
                        <AnimatedList
                            className="overflow-y-auto"
                            items={scoreboardItems}
                            itemClassName="cursor-pointer"
                            showGradients={true}
                            displayScrollbar={false}
                        />
                    </div>
                </Plate>
            </div>
            

            <div className="max-w-[calc(100vw-614px)] w-full h-full inline-flex flex-col items-center justify-center">
                <Plate className="w-full h-16 top-0 mx-auto flex items-center justify-around mb-2 bg-[#000A2233]" pathDataTemplate="M 8 0 H width-L1 h 56 l 8 8 V height-L1 v 56 l -8 8 H ts h -56 l -8 -8 V 8 l 8 -8 Z">
                    <div className="w-full flex justify-around text-2xl p-3">
                        <StatisticsItem name="score" value={score} />
                        <StatisticsItem name="coins" value={coin} />
                        <StatisticsItem name="difficulty" value={difficulty} />
                        <StatisticsItem name="timer" value={timer} />
                    </div>
                </Plate>

                <div className="w-full mx-auto h-full flex flex-col items-center justify-center">
                    <Plate className="w-full h-full p-6" pathDataTemplate="M 8 8 h 48 l 8 -8 H width-L1 l 8 8 h 48 v 48 l 8 8 V height-L1 l -8 8 v 48 h -48 l -8 8 H ts l -8 -8 h -48 v -48 l -8 -8 V ts l 8 -8 v -48 Z M 32 0 v ts M 0 32 h ts M width-L.5 0 v ts M width ts-1/2 h -ts M width-L.5 height v -ts M width height-L.5 h -ts M ts-1/2 height v -ts M 0 height-L.5 h ts">
                        <div className="w-full h-full text-center mb-6">
                            <TextType
                                text={equation}
                                typingSpeed={40}
                                initialDelay={100}
                                className="text-8xl font-bold"
                                userInput={inputValue}
                                isInputActive={isInputActive}
                                setIsInputActive={setIsInputActive}
                                textColors={["#E8D8A1"]}
                            />
                        </div>
                    </Plate>
                    {/* Input removed, user types directly in TextType */}
                </div>
            </div>

            <div className="max-w-[300px] w-full h-full inline-flex flex-col right-0 top-0 absolute">
                <Plate className="w-full h-16 left-0 right-0 p-2 flex mb-2 bg-[#000A2233]" pathDataTemplate="M 8 0 H width-L1 h 56 l 8 8 V height-L1 v 56 l -8 8 H ts h -56 l -8 -8 V 8 l 8 -8 Z">
                    <h4 className="w-full text-4xl font-parismatch text-[#E8D8A1] mb-2">Abilities</h4>
                </Plate>
                <Plate className="w-full h-full left-0 right-0 p-2 flex bg-[#000A2233]" pathDataTemplate="M 8 0 H width-L1 h 56 l 8 8 V height-L1 v 56 l -8 8 H ts h -56 l -8 -8 V 8 l 8 -8 Z">
                    <div className="w-full h-full min-height:0 overflow-y-auto">
                        {abilities.map((a, i) => (
                            <AbilityCard
                                key={a.id}
                                ref={(el) => { abilityRefs.current[i] = el; }}
                                name={a.name}
                                image={a.image}
                                cost={abilityCosts[i]}
                                keybind={keymap[i]}
                                onClick={() => attemptBuy(i)}
                                className="mb-2"
                            />
                        ))}
                    </div>
                </Plate>
            </div>
        </div>
    );
}
