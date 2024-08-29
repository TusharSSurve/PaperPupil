import { useRouter, useSearchParams } from "next/navigation"
import { trpc } from "../_trpc/client";
import { TRPCClientError } from "@trpc/client";

export default function Page() {
  const router = useRouter();

  const searchParams = useSearchParams();
  const origin = searchParams.get('origin');

  trpc.authCallback.useQuery(undefined, {
    onSuccess: ({ success }) => {
      if (success) {
        // user is synced to db
        router.push(origin ? `/${origin}` : '/dashboard')
      }
    },
    onError: (err: TRPCClientError<any>) => {
      if (err.data?.code === 'UNAUTHORIZED') {
        router.push('/sign-in')
      }
    },
    retry: true,
    retryDelay: 500,
  })
  return (
    <div>page</div>
  )
}
