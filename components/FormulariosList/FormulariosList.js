'use client'

import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { format } from "date-fns"

export default function FormulariosList({ type }) {
  const [forms, setForms] = useState([])
  const [filteredForms, setFilteredForms] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDate, setSelectedDate] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedForm, setSelectedForm] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formToDelete, setFormToDelete] = useState(null)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  
  const itemsPerPage = 20
  const maxPages = Math.ceil(filteredForms.length / itemsPerPage)

  useEffect(() => {
    fetchForms()
  }, [type])

  const fetchForms = async () => {
    const response = await fetch(`/api/forms/${type}`)
    const data = await response.json()
    setForms(data)
    setFilteredForms(data)
  }

  useEffect(() => {
    let filtered = [...forms]
    
    if (searchTerm) {
      filtered = filtered.filter(form => 
        form.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.id.toString().includes(searchTerm)
      )
    }
    
    if (selectedDate) {
      filtered = filtered.filter(form => {
        const formDate = new Date(form.createdAt).toDateString()
        const filterDate = selectedDate.toDateString()
        return formDate === filterDate
      })
    }
    
    setFilteredForms(filtered)
    setCurrentPage(1)
  }, [forms, searchTerm, selectedDate])

  const getCurrentPageItems = () => {
    const start = (currentPage - 1) * itemsPerPage
    const end = start + itemsPerPage
    return filteredForms.slice(start, end)
  }

  const truncateText = (text, length = 50) => {
    return text.length > length ? `${text.substring(0, length)}...` : text
  }

  const handleRowClick = (form) => {
    setSelectedForm(form)
    setIsModalOpen(true)
  }

  const handleDelete = async (formId) => {
    try {
      const response = await fetch(`/api/forms/${type}/${formId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Actualizar estado local después de eliminar
        const updatedForms = forms.filter(form => form.id !== formId);
        setForms(updatedForms);
        setFilteredForms(updatedForms.filter(form => {
          // Mantener filtros actuales
          if (searchTerm && !form.nombre.toLowerCase().includes(searchTerm.toLowerCase())) return false;
          if (selectedDate) {
            const formDate = new Date(form.createdAt).toDateString();
            const filterDate = selectedDate.toDateString();
            if (formDate !== filterDate) return false;
          }
          return true;
        }));
        setShowDeleteAlert(false);
      } else {
        throw new Error('Error al eliminar el formulario');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const renderPagination = () => {
    const pages = []
    const maxVisiblePages = maxPages > 10 ? 10 : maxPages

    for (let i = 1; i <= maxVisiblePages; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink 
            onClick={() => setCurrentPage(i)}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      )
    }

    if (maxPages > maxVisiblePages) {
      pages.push(
        <PaginationItem key="ellipsis">
          <PaginationEllipsis />
        </PaginationItem>
      )
    }

    return pages
  }

  return (
    <div className="grid grid-cols-4 gap-6">
      <div className="col-span-1 space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Buscar</h3>
          <Input
            placeholder="Buscar por nombre o ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Filtrar por fecha</h3>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
          />
          {selectedDate && (
            <Button 
              variant="outline" 
              onClick={() => setSelectedDate(null)}
              className="w-full"
            >
              Limpiar fecha
            </Button>
          )}
        </div>
      </div>

      <div className="col-span-3">
        <Table>
          <TableHeader>
          <TableRow>
      <TableHead>ID</TableHead>
      <TableHead>Nombre</TableHead>
      <TableHead>Fecha</TableHead>
      <TableHead>Mensaje</TableHead>
      <TableHead className="text-right">Acciones</TableHead>
    </TableRow>
          </TableHeader>
          <TableBody>
          {getCurrentPageItems().map((form) => (
      <TableRow 
        key={form.id}
        className="cursor-pointer hover:bg-slate-100"
      >
        <TableCell onClick={() => handleRowClick(form)}>{form.id}</TableCell>
        <TableCell onClick={() => handleRowClick(form)}>{form.nombre}</TableCell>
        <TableCell onClick={() => handleRowClick(form)}>
          {format(new Date(form.createdAt), 'dd/MM/yyyy')}
        </TableCell>
        <TableCell onClick={() => handleRowClick(form)}>
          {truncateText(form.mensaje)}
        </TableCell>
        <TableCell className="text-right">
          <Button
            variant="destructive"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setFormToDelete(form);
              setShowDeleteAlert(true);
            }}
          >
            Eliminar
          </Button>
        </TableCell>
      </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                />
              </PaginationItem>
              
              {renderPagination()}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, maxPages))}
                  disabled={currentPage === maxPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente este formulario.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-700"
            onClick={() => {
              handleDelete(formToDelete.id);
              setShowDeleteAlert(false);
            }}
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl">
          {selectedForm && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Detalles del Formulario</h2>
              {Object.entries(selectedForm).map(([key, value]) => (
                <div key={key} className="grid grid-cols-3 gap-4">
                  <dt className="font-medium capitalize">{key}:</dt>
                  <dd className="col-span-2">{value}</dd>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}