"use client"

import { logoutCurrentUser } from "@/actions/actions";
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User } from "lucide-react"
import Link from "next/link";

export function AppDropdownMenu({title}: {title: React.ReactNode}) {

    const handleLogout = async () => {
        await logoutCurrentUser();
    }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline"><div><User/></div>{title}</Button>} />
      <DropdownMenuContent className="w-40" align="start">
        <DropdownMenuGroup>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuItem render={<Link href={"/settings"}/>}>
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem variant="destructive" onClick={handleLogout}>
            Log out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
