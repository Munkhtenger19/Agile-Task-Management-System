import React from 'react'
import { Card, CardContent } from './ui/card'
import { BookMarked } from 'lucide-react'

export default function BoardCard({text, boardsNum}: {text: string, boardsNum: number}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 sm:gap-6 mb-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between space-y-2">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">
                  {text}
                </p>
                <p>{boardsNum}</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg">
                <BookMarked className="size-5 sm:size-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  )
}
