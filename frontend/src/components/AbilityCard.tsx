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
                    <Plate className="w-full h-full flex-shrink-0" pathDataTemplate="M 8 0 H width-L1 h 56 l 8 8 V height-L1 v 56 l -8 8 H ts h -56 l -8 -8 V 8 l 8 -8 Z">
                        <div className="flex items-center justify-center">
                            <div className="w-16 h-16 flex items-center justify-center overflow-hidden">
                                {image ? <img src={image} alt={name} className="w-full h-full object-cover" /> : <div className="text-xs text-slate-400">img</div>}
                            </div>
                            <div className="flex-1 text-lg text-[#E8D8A1] flex items-center justify-between gap-4 mr-6">
                                <div className="flex items-center gap-2 font-parismatch">
                                    <div>{name}</div>
                                    {keybind && <div className="text-xs text-slate-400 ml-2">[{keybind}]</div>}
                                </div>
                                <div className="text-lg text-yellow-300">{cost}</div>
                            </div>
                        </div>
                    </Plate>
                </div>
            </GlareHover>
        );
    }
);

AbilityCard.displayName = 'AbilityCard';

export default AbilityCard;
