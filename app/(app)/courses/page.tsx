'use client'

import { useState } from 'react'
import { Search, Plus } from 'lucide-react'
import { COURSES } from '@/lib/mock-data'
import { CourseCard } from '@/components/courses/course-card'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupInput, InputGroupAddon } from '@/components/ui/input-group'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { useAuth } from '@/providers/auth-provider'

const CATEGORIES = ['All', 'Grade 12']

export default function CoursesPage() {
  const { role } = useAuth()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')

  const filtered = COURSES.filter((c) => {
    const matchesQuery =
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.description.toLowerCase().includes(query.toLowerCase())
    const matchesCategory = category === 'All' || c.category === category
    return matchesQuery && matchesCategory
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Courses"
        description={
          role === 'teacher'
            ? 'Manage your courses, chapters and lessons.'
            : 'Continue learning and track your progress.'
        }
        action={
          role === 'teacher' ? (
            <Button>
              <Plus data-icon="inline-start" />
              New course
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <InputGroup className="sm:max-w-xs">
          <InputGroupInput
            placeholder="Search courses..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>

        <ToggleGroup
          value={[category]}
          onValueChange={(v) => setCategory((v[0] as string) ?? 'All')}
          className="w-fit"
        >
          {CATEGORIES.map((cat) => (
            <ToggleGroupItem key={cat} value={cat}>
              {cat}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {filtered.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No courses found</EmptyTitle>
            <EmptyDescription>Try a different search term or category.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  )
}
