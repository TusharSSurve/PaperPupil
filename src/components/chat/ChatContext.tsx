import { useToast } from "@/hooks/use-toast"
import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import { createContext } from "vm"

type StreamResponse = {
  addMessage: () => void
  message: string
  handleInputChange: (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => void
  isLoading: boolean
}

export const ChatContext = createContext({
  addMessage: () => { },
  message: '',
  handleInputChange: () => { },
  isLoading: false,
});

type Props = {
  fileId: string;
  children: React.ReactNode
}
export const ChatContextProvider = ({ fileId, children }: Props) => {
  const [message, setMessage] = useState('');
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { mutate: sendMessage } = useMutation({
    mutationFn: async ({ message }: { message: string }) => {
      const response = await fetch('/api/message', {
        method: 'POST',
        body: JSON.stringify({
          fileId,
          message
        })
      })
      if (!response.ok) {
        throw new Error('Failed to send message')
      }
      return response.body;
    }
  })

  const addMessage = () => sendMessage({ message });

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  }

  return (
    <ChatContext.Provider value={{
      addMessage,
      message,
      handleInputChange,
      isLoading
    }}></ChatContext.Provider>
  )
}