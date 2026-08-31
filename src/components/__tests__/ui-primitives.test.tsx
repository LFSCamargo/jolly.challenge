import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

describe('shadcn primitives', () => {
  it('renders the installed design-system components', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Shows</CardTitle>
          <CardDescription>Browse TVMaze</CardDescription>
          <CardAction>
            <DropdownMenu>
              <DropdownMenuTrigger>More</DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuGroup>
                  <DropdownMenuItem>Favorite</DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardAction>
        </CardHeader>
        <CardContent>
          <Input aria-label="Search shows" />
          <Select>
            <SelectTrigger aria-label="Filter by status">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="running">Running</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </CardContent>
        <CardFooter>
          <Button>Retry</Button>
        </CardFooter>
      </Card>,
    )

    expect(screen.getByText('Shows')).toBeInTheDocument()
    expect(screen.getByText('Browse TVMaze')).toBeInTheDocument()
    expect(screen.getByLabelText('Search shows')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'More' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Filter by status' })).toBeInTheDocument()
  })
})
