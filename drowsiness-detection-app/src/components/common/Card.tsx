import type { ReactNode } from "react";

interface CardProps {
    children: ReactNode;
    className?: string;
}

export const Card = ({ children, className = '' }: CardProps) => {
    return (
        <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
            {children}
        </div>
    );
};