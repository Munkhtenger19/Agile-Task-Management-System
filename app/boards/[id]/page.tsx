"use client"
import Navbar from '@/components/navbar'
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBoard } from '@/lib/hooks/useBoards'
import { useParams } from 'next/navigation';
import React, { useState } from 'react'

export default function BoardPage() {
    const {id} = useParams<{id: string}>();
    const { board, updateBoard } = useBoard(id);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [newTitle, setNewTitle] = useState(board?.title || '');
    const handleUpdateBoardTitle = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!newTitle.trim() || !board) return;
        try {
            await updateBoard(board.id, { title: newTitle.trim() });
            setIsEditingTitle(false);
        } catch (error) {
            console.log(error);
        }
    }

    return (
    <div className='min-h-screen bg-gray-60'>
      <Navbar boardTitle={board?.title} onEditBoard={() => setIsEditingTitle(true)}/>
      <Dialog open={isEditingTitle} onOpenChange={setIsEditingTitle}>
        <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
            <DialogHeader>
                <DialogTitle>Edit Board Title</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateBoardTitle}>
                <div>
                    <Label htmlFor="board-title">
                        Board Title
                    </Label>
                    <Input id="board-title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required placeholder='Enter board title'/>
                </div>
                <div className='flex justify-end mt-4'>
                    <Button type="button" variant="ghost" onClick={() => setIsEditingTitle(false)}> Cancel</Button>
                    <Button type="submit">Save</Button>
                </div>
            </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
