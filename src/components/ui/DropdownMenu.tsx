import { Button } from "@/components/ui/ShadcnComponents/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/ShadcnComponents/dropdown-menu"

export default function DropdownMenuComp() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="!p-2 !m-0 secondary-btn group">
          <i className="fa-solid fa-bars text-xl duration-200"></i>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">

        <DropdownMenuGroup>
          <DropdownMenuItem>
            Dashboard
            <DropdownMenuShortcut><span className="text-sm"><i className="fa-solid fa-chart-bar"></i></span></DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Settings
            <DropdownMenuShortcut><span className="text-sm"><i className="fa-solid fa-gear"></i></span></DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem>
            Log out
            <DropdownMenuShortcut><span className="text-sm"><i className="fa-solid fa-right-from-bracket"></i></span></DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>

      </DropdownMenuContent>
    </DropdownMenu>
  )
}


// import { useRouter } from 'next/navigation'
// import React, { useState } from 'react'
// import { useAuth } from '../../context/AuthContext'
// import { useTransactions } from '@/context/TransactionsContext'
// import { useSettingsStore } from '@/context/SettingsState'

// const DropdownMenu = () => {
//   const { logout } = useAuth()
//   const { clearTransactions } = useTransactions()
//   const setDefaultUserSettings = useSettingsStore(state => state.setDefaultUserSettings)

//   const logoutUser = async (): Promise<void> => {
//     await logout()
//     clearTransactions()
//     setDefaultUserSettings()
//   }
//   const [isOpen, setIsOpen] = useState(false)
//   const router = useRouter()

//   const toggleMenu = () => setIsOpen(!isOpen)

//   return (
//     <div className="relative inline-block text-left">
// <button
//   onClick={toggleMenu}
//   className="!p-2 !m-0 !bg-transparent secondary-btn group"
// >
//   <i className="fa-solid fa-bars text-xl group-hover:text-sky-300 duration-200"></i>
// </button>

//       {/* Underlay */}
//       {isOpen && (
//         <div
//           onClick={() => setIsOpen(false)}
//           className="fixed inset-0 z-0 bg-transparent"
//         />
//       )}

//       <div
//         className={`absolute right-0 mt-2 w-40 bg-[var(--background)] border border-[var(--color-light-blue)] rounded-sm z-10 duration-300 ease-in-out ${isOpen
//             ? 'opacity-100 scale-100 visible'
//             : 'opacity-0 scale-95 invisible'
//           }`}
//         style={{ boxShadow: '0 0 15px 1px var(--background)' }}
//       >
//         <ul>
//           <li
//             onClick={() => {
//               toggleMenu()
//               router.push('/')
//             }}
//             className="px-4 py-2 hover:bg-[var(--background-muted)] duration-200 cursor-pointer"
//           >
//             Dashboard
//           </li>
//           <li
//             onClick={() => {
//               toggleMenu()
//               router.push('/settings')
//             }}
//             className="px-4 py-2 hover:bg-[var(--background-muted)] duration-200 cursor-pointer"
//           >
//             Settings
//           </li>
//           <li
//             onClick={() => {
//               toggleMenu()
//               logoutUser()
//             }}
//             className="px-4 py-2 hover:bg-[var(--background-muted)] duration-200 cursor-pointer"
//           >
//             Logout
//           </li>
//         </ul>
//       </div>
//     </div>
//   )
// }

// export default DropdownMenu
