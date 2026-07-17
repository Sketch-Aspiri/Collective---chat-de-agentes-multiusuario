interface ChatHeaderProps {
  name: string;
}

export function ChatHeader({ name }: ChatHeaderProps) {
  return <h2 className="text-lg font-semibold p-4 border-b">{name}</h2>;
}
