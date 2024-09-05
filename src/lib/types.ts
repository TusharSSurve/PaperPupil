import { AppRouter } from "@/trpc";
import { inferRouterOutputs } from "@trpc/server";

export type ChildrenProps = {
  className?: string;
  children: React.ReactNode
}

type RouterOutput = inferRouterOutputs<AppRouter>
type Messages = RouterOutput['getFileMessages']['messages']
type OmitText = Omit<Messages[number], 'text'>
type ExtendedText = {
  text: string | JSX.Element
}

export type ExtendedMessage = OmitText & ExtendedText;