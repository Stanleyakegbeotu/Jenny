import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ExternalLink, Upload, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Book as SupabaseBook, createBook, updateBook, deleteBook, fetchBooks, uploadCover, createChapter, fetchChapters, updateChapter } from '../../../lib/supabaseClient';
import { motion } from 'motion/react';

interface BookFormData {
  title: string;
  description: string;
  cover_url: string;
  inkitt_url: string;
  wattpad_url: string;
  chapter_1_text: string;
}

export function BooksManagement() {
  const [books, setBooks] = useState<SupabaseBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<SupabaseBook | null>(null);
  const [formData, setFormData] = useState<BookFormData>({
    title: '',
    description: '',
    cover_url: '',
    inkitt_url: '',
    wattpad_url: '',
    chapter_1_text: '',
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load books on mount
  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const data = await fetchBooks();
      setBooks(data);
      setError(null);
    } catch (err) {
      console.error('Error loading books:', err);
      setError('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setCoverPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      cover_url: '',
      inkitt_url: '',
      wattpad_url: '',
      chapter_1_text: '',
    });
    setCoverFile(null);
    setCoverPreview('');
    setEditingBook(null);
    setError(null);
  };

  const handleOpenModal = (book?: SupabaseBook) => {
    if (book) {
      setEditingBook(book);
      setFormData({
        title: book.title,
        description: book.description,
        cover_url: book.cover_url,
        inkitt_url: book.inkitt_url || '',
        wattpad_url: book.wattpad_url || '',
        chapter_1_text: '',
      });
      setCoverPreview(book.cover_url);
      
      // Fetch chapter 1 text if exists
      fetchChapters(book.id).then((chapters) => {
        if (chapters.length > 0) {
          setFormData((prev) => ({
            ...prev,
            chapter_1_text: chapters[0].content || '',
          }));
        }
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSaveBook = async () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }

    if (!formData.chapter_1_text.trim()) {
      setError('Chapter 1 text is required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      let cover_url = formData.cover_url;

      // Upload cover if a new file was selected
      if (coverFile) {
        cover_url = await uploadCover(coverFile, editingBook?.id || Date.now().toString());
        if (!cover_url) {
          throw new Error('Failed to upload cover image');
        }
      }

      const bookData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        cover_url: cover_url,
        inkitt_url: formData.inkitt_url.trim(),
        wattpad_url: formData.wattpad_url.trim(),
        audio_url: '', // No longer used, TTS handles audio
      };

      if (editingBook) {
        // Update existing book
        const updated = await updateBook(editingBook.id, bookData);
        if (updated) {
          setBooks(books.map((b) => (b.id === editingBook.id ? updated : b)));
          
          // Update or create chapter 1
          const existingChapters = await fetchChapters(editingBook.id);
          if (existingChapters.length > 0) {
            await updateChapter(existingChapters[0].id, {
              content: formData.chapter_1_text.trim(),
            });
          } else {
            await createChapter({
              book_id: editingBook.id,
              title: 'Chapter 1',
              content: formData.chapter_1_text.trim(),
              order: 1,
            });
          }
        }
      } else {
        // Create new book
        const created = await createBook(bookData);
        if (created) {
          setBooks([created, ...books]);
          
          // Create chapter 1
          await createChapter({
            book_id: created.id,
            title: 'Chapter 1',
            content: formData.chapter_1_text.trim(),
            order: 1,
          });
        }
      }

      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      console.error('Error saving book:', err);
      setError(err instanceof Error ? err.message : 'Failed to save book');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    if (!confirm('Are you sure you want to delete this book?')) return;

    try {
      const success = await deleteBook(bookId);
      if (success) {
        setBooks(books.filter((b) => b.id !== bookId));
      } else {
        setError('Failed to delete book');
      }
    } catch (err) {
      console.error('Error deleting book:', err);
      setError('Failed to delete book');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl mb-2 font-playfair">Books Management</h1>
          <p className="text-muted-foreground">Manage your published and draft books.</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={() => handleOpenModal()}
            >
              <Plus className="w-4 h-4 mr-2 text-[var(--icon-success)]" />
              Add New Book
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingBook ? 'Edit Book' : 'Add New Book'}</DialogTitle>
              <DialogDescription>
                {editingBook
                  ? 'Update the book details below'
                  : 'Fill in the book details to add a new book'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-destructive/10 border border-destructive/20 rounded-lg p-3"
                >
                  <p className="text-sm text-destructive">{error}</p>
                </motion.div>
              )}

              {/* Cover Upload */}
              <div>
                <label className="text-sm font-medium">Book Cover</label>
                <div className="mt-2">
                  {coverPreview ? (
                    <div className="relative w-32 h-48 rounded-lg overflow-hidden shadow-lg">
                      <ImageWithFallback
                        src={coverPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => {
                          setCoverFile(null);
                          setCoverPreview('');
                        }}
                        className="absolute top-1 right-1 bg-black/50 rounded-full p-1 hover:bg-black/70"
                        title="Remove cover image"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Click to upload cover image</p>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-sm font-medium">Title *</label>
                <Input
                  name="title"
                  placeholder="Book title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium">Description *</label>
                <Textarea
                  name="description"
                  placeholder="Book description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="mt-1"
                />
              </div>

              {/* External Links */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Inkitt URL</label>
                  <Input
                    name="inkitt_url"
                    placeholder="https://inkitt.com/..."
                    value={formData.inkitt_url}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Wattpad URL</label>
                  <Input
                    name="wattpad_url"
                    placeholder="https://wattpad.com/..."
                    value={formData.wattpad_url}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Audio URL */}
              <div>
                <label className="text-sm font-medium">Chapter 1 Text *</label>
                <Textarea
                  name="chapter_1_text"
                  placeholder="Paste the text of chapter 1. This will be used for both text display and text-to-speech narration."
                  value={formData.chapter_1_text}
                  onChange={handleInputChange}
                  rows={6}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Users will be able to read and listen to this chapter with TTS controls.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveBook}
                  disabled={isSaving}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isSaving ? 'Saving...' : editingBook ? 'Update Book' : 'Add Book'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Books Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Books ({books.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading books...</p>
            </div>
          ) : books.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No books yet. Create your first book!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cover</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Platform Links</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {books.map((book) => (
                    <TableRow key={book.id}>
                      <TableCell>
                        <div className="w-12 h-16 rounded overflow-hidden">
                          <ImageWithFallback
                            src={book.cover_url}
                            alt={book.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{book.title}</TableCell>
                      <TableCell className="max-w-xs truncate text-sm">
                        {book.description}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {book.inkitt_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <a
                                href={book.inkitt_url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="w-4 h-4 mr-1 text-[var(--icon-accent)]" />
                                Inkitt
                              </a>
                            </Button>
                          )}
                          {book.wattpad_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <a
                                href={book.wattpad_url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="w-4 h-4 mr-1 text-[var(--icon-info)]" />
                                Wattpad
                              </a>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenModal(book)}
                          >
                            <Edit className="w-4 h-4 text-[var(--icon-info)]" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteBook(book.id)}
                          >
                            <Trash2 className="w-4 h-4 text-[var(--icon-primary)]" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
