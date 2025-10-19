import CountUp from './CountUp';

interface StatisticsItemProps {
  name: string;
  value: number;
  className?: string;
}

export default function StatisticsItem({ name, value, className = '' }: StatisticsItemProps) {
    return (
        <div className={`flex items-center justify-between py-1 rounded ${className}`}>
            <div className="text-[#E8D8A1] font-parismatch capitalize pr-3">{name}</div>
            <div className="text-[#E8D8A1] font-parismatch">
                <CountUp to={value} from={0} duration={0.6} className="inline-block" />
            </div>
        </div>
    );
}
