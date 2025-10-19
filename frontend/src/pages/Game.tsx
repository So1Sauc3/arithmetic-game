"use client";

import AnimatedList from "@/components/AnimatedList";
// import TextType from "@/components/TextType";
import { useEffect, useMemo, useRef, useState } from "react";
import StatisticsItem from "@/components/StatisticsItem";
import AbilityCard from "@/components/AbilityCard";
import Plate from "@/components/Plate";

type Ability = { id: string; name: string; image?: string };

export default function Game() {
    const [inputValue, setInputValue] = useState<string>("")
    const [timer, ___] = useState<number>(60);

    const { socket, question, score, coins, players } = usePage();
    // setDifficulty(question.difficulty)

    const inputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        setInputValue(inputValue)
        if (inputValue !== "") {
            socket.sendSubmit(Number(inputValue));
        }
    };

    const [questionText, setQuestionText] = useState<string>("");
    useEffect(() => {
        setQuestionText(question.question);
        setInputValue("")
    }, [question]);

    // 10 abilities, keys QWERTYUIOP
    const keymap = "QWERTYUIOP".split("");
    const [abilities] = useState<Ability[]>(
        Array.from({ length: 10 }).map((_, i) => ({
            id: `a${i + 1}`,
            name: `Ability ${i + 1}`,
            image: undefined,
        })),
    );

    // costs assigned to each ability
    // FIXME: remove
    const abilityCosts = useMemo(
        () => abilities.map((_, i) => 1 + i * 2),
        [abilities],
    );

    const abilityRefs = useRef<Array<HTMLDivElement | null>>(
        Array(10).fill(null),
    );

    // attempt to buy & use an ability by index
    const attemptBuy = (index: number) => {
        const cost = abilityCosts[index] ?? 0;
        const el = abilityRefs.current[index];
        if (cost <= coins) {
            // success: deduct coins and apply effect
            // setCoin(c => c - cost);
            // setScore(s => s + 5 + index);
            if (el && typeof el.animate === "function") {
                el.animate(
                    [
                        { transform: "translateY(0)" },
                        { transform: "translateY(4px)" },
                        { transform: "translateY(0)" },
                    ],
                    { duration: 180, easing: "ease-in-out" },
                );
            }
        } else {
            // failure: shake
            if (el && typeof el.animate === "function") {
                el.animate(
                    [
                        { transform: "translateX(0)" },
                        { transform: "translateX(-6px)" },
                        { transform: "translateX(6px)" },
                        { transform: "translateX(0)" },
                    ],
                    { duration: 240, easing: "ease-in-out" },
                );
            }
        }
    };

    return (
        // <Plate className="" pathDataTemplate="M 0 0 H width V height H 0 Z">

        // </Plate>
        <div className="w-screen h-screen relative overflow-hidden text-[#E8D8A1]">
            <div className="w-[300px] h-full left-0 top-0 absolute bg-[#000A2233]">
                <Plate className="w-full h-16 left-0 right-0 p-2 flex mb-2" pathDataTemplate="M 0 0 H width V height H 0 Z">
                    <h4 className="w-full text-md text-slate-300 mb-2">Scoreboard</h4>
                </Plate>
                <Plate className="w-full h-full absolute flex left-0 right-0" pathDataTemplate="M 0 0 H width V height H 0 Z">
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
            

            <Plate className="max-w-[calc(100vw-612px)] h-16 top-0 mx-auto flex items-center justify-around bg-[#000A2233]" pathDataTemplate="M 0 0 H width V height H 0 Z">
                <div className="w-full flex justify-around text-2xl p-3">
                    <StatisticsItem name="score" value={score} />
                    <StatisticsItem name="coins" value={coin} />
                    <StatisticsItem name="difficulty" value={difficulty} />
                    <StatisticsItem name="timer" value={timer} />
                </div>
            </Plate>

            <div className="max-w-[800px] mx-auto h-full flex flex-col items-center justify-center">
                <div className="flex justify-center items-center w-full text-center mb-6 text-8xl">
                    <p className="pr-5">{questionText}</p>
                    <input
                        className="appearance-none firefox:textfield ml-1 bg-transparent border-none outline-none text-inherit w-auto inline-block max-w-[6ch]"
                        type="number"
                        autoFocus
                        value={inputValue}
                        onChange={inputHandler}
                    />
                </div>
                {/* Input removed, user types directly in TextType */}
            </div>

            <div className="w-[300px] h-screen right-0 top-0 absolute bg-[#000A2233]">
                <Plate className="w-full h-16 left-0 right-0 p-2 flex mb-2" pathDataTemplate="M 0 0 H width V height H 0 Z">
                    <h4 className="w-full text-md text-slate-300 mb-2">Abilities</h4>
                </Plate>
                <Plate className="w-full h-full left-0 right-0 p-2 flex" pathDataTemplate="M 0 0 H width V height H 0 Z">
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
