import { Button } from "@/components/ui/ShadcnComponents/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/ShadcnComponents/dropdown-menu"
import { useAppStore } from "@/context/AppStore"
import { useAuth } from "@/context/AuthContext"
import { useCurrentBalance } from "@/context/CurrentBalance"
import { useSettingsStore } from "@/context/SettingsState"
import { useTransactions } from "@/context/TransactionsContext"
import { useRouter } from "next/navigation"

export default function DropdownMenuComp() {
  const router = useRouter()
  const { logout } = useAuth()
  const { clearTransactions } = useTransactions()
  const { clearCurrentBalance } = useCurrentBalance()
  const setDefaultUserSettings = useSettingsStore(state => state.setDefaultUserSettings)

  const logoutUser = async (): Promise<void> => {
    clearTransactions()
    clearCurrentBalance()
    setDefaultUserSettings()

    await logout()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="!p-2 !m-0 primary-btn !bg-[var(--background-muted)] group">
          <i className="fa-solid fa-bars text-xl duration-200"></i>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">

        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => { router.push('/') }}>
            Dashboard
            <DropdownMenuShortcut><span className="text-sm"><i className="fa-solid fa-chart-bar"></i></span></DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => { router.push('/settings') }}>
            Settings
            <DropdownMenuShortcut><span className="text-sm"><i className="fa-solid fa-gear"></i></span></DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem onClick={logoutUser}>
            Log out
            <DropdownMenuShortcut><span className="text-sm"><i className="fa-solid fa-right-from-bracket"></i></span></DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>

      </DropdownMenuContent>
    </DropdownMenu>
  )
}
