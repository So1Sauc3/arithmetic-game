// lightweight ability card with cost and keybind display
import { forwardRef } from 'react';
import GlareHover from './GlareHover';
import Plate from './Plate';

interface AbilityCardProps {
  name: string;
  image?: string;
  onClick?: () => void;
  className?: string;
  cost?: number;
  keybind?: string;
}

const AbilityCard = forwardRef<HTMLDivElement, AbilityCardProps>(
    ({ name, image, onClick, className = '', cost = 0, keybind }, ref) => {
        return (
            <GlareHover>
                <div
                    ref={ref}
                    onClick={onClick}
                    className={`w-full cursor-pointer select-none flex items-center gap-3 ${className}`}
                >
                    <Plate className="w-full h-full flex-shrink-0" pathDataTemplate="M 0 0 H width V height H 0 Z">
                        <div className="w-10 h-12 bg-[#000C44B2] flex items-center justify-center overflow-hidden">
                            {image ? <img src={image} alt={name} className="w-full h-full object-cover" /> : <div className="text-xs text-slate-400">img</div>}
                        </div>
                        <div className="flex-1 text-sm text-white flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <div>{name}</div>
                                {keybind && <div className="text-xs text-slate-400 ml-2">[{keybind}]</div>}
                            </div>
                            <div className="text-sm text-yellow-300">{cost}</div>
                        </div>
                    </Plate>
                </div>
            </GlareHover>
        );
    }
);

AbilityCard.displayName = 'AbilityCard';

export default AbilityCard;
