// lightweight ability card with cost and keybind display
import { forwardRef } from 'react';
import GlareHover from './GlareHover';

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
                    className={`ability-card w-full cursor-pointer select-none bg-[#000C44B2] border-2 border-[#E8D8A1] p-3 flex items-center gap-3 ${className}`}
                    style={{ boxShadow: '0 0 0px rgba(232,216,161,0)' }}
                >
                    <div className="w-10 h-10 bg-[#000C44B2] flex items-center justify-center overflow-hidden">
                    {image ? <img src={image} alt={name} className="w-full h-full object-cover" /> : <div className="text-xs text-slate-400">img</div>}
                    </div>
                    <div className="flex-1 text-sm text-white flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div>{name}</div>
                        {keybind && <div className="text-xs text-slate-400 ml-2">[{keybind}]</div>}
                    </div>
                    <div className="text-sm text-yellow-300">{cost}</div>
                    </div>
                </div>
            </GlareHover>
        );
    }
);

AbilityCard.displayName = 'AbilityCard';

export default AbilityCard;
