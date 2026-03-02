import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Upload, X } from 'lucide-react';
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
  book_link: string;
  book_platform: string;
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
    book_link: '',
    book_platform: '',
    chapter_1_text: '',
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
      book_link: '',
      book_platform: '',
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
        book_link: book.book_link || '',
        book_platform: book.book_platform || '',
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

    // For new books, require a cover image
    if (!editingBook && !coverFile && !coverPreview) {
      setError('Book cover image is required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      let cover_url: string | null = formData.cover_url;

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
        ...(formData.book_link.trim() && { book_link: formData.book_link.trim() }),
        ...(formData.book_platform && { book_platform: formData.book_platform }),
      };

      if (editingBook) {
        // Update existing book
        const updated = await updateBook(editingBook.id, bookData);
        if (!updated) {
          throw new Error('Failed to update book');
        }
        setBooks(books.map((b) => (b.id === editingBook.id ? updated : b)));
        
        // Update or create chapter 1
        const existingChapters = await fetchChapters(editingBook.id);
        if (existingChapters.length > 0) {
          const updateSuccess = await updateChapter(existingChapters[0].id, {
            title: 'Chapter 1',
            content: formData.chapter_1_text.trim(),
            chapter_number: 1,
          });
          if (!updateSuccess) {
            throw new Error('Failed to update chapter content');
          }
        } else {
          const chapterCreated = await createChapter({
            book_id: editingBook.id,
            title: 'Chapter 1',
            content: formData.chapter_1_text.trim(),
            chapter_number: 1,
          });
          if (!chapterCreated) {
            throw new Error('Failed to create chapter');
          }
        }
      } else {
        // Create new book
        const created = await createBook(bookData);
        if (!created) {
          throw new Error('Failed to create book. Please check the console for details.');
        }
        setBooks([created, ...books]);
        
        // Create chapter 1
        const chapterCreated = await createChapter({
          book_id: created.id,
          title: 'Chapter 1',
          content: formData.chapter_1_text.trim(),
          chapter_number: 1,
        });
        
        if (!chapterCreated) {
          throw new Error('Failed to create chapter. The book was created, but chapter content could not be saved.');
        }
      }

      setIsModalOpen(false);
      resetForm();
      setSuccess(editingBook ? 'Book updated successfully!' : 'Book created successfully!');
      setTimeout(() => setSuccess(null), 3000);
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
      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-green-500/10 border border-green-500/20 rounded-lg p-4"
        >
          <p className="text-sm text-green-600 font-medium">{success}</p>
        </motion.div>
      )}
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl mb-2 font-playfair truncate">Books Management</h1>
          <p className="text-muted-foreground text-sm md:text-base">Manage your published and draft books.</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-primary hover:bg-primary/90 w-full md:w-auto"
              onClick={() => handleOpenModal()}
            >
              <Plus className="w-4 h-4 md:mr-2 text-[var(--icon-success)]" />
              <span className="hidden md:inline">Add New Book</span>
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
                <label className="text-sm font-medium">
                  Book Cover {!editingBook && <span className="text-destructive">*</span>}
                </label>
                <p className="text-xs text-muted-foreground mt-1 mb-2">
                  {editingBook ? 'Add or update' : 'Upload a'} book cover image (JPG, PNG)
                </p>
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

              {/* Chapter 1 Text */}
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

              {/* Book Platform Selection */}
              <div>
                <label htmlFor="book_platform" className="text-sm font-medium">Book Platform (Optional)</label>
                <select
                  id="book_platform"
                  name="book_platform"
                  value={formData.book_platform}
                  onChange={(e) => handleInputChange(e as any)}
                  className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  aria-label="Select book platform"
                >
                  <option value="">Select a platform...</option>
                  <option value="Inkitt">Inkitt</option>
                  <option value="Wattpad">Wattpad</option>
                  <option value="Amazon">Amazon</option>
                  <option value="Apple Books">Apple Books</option>
                  <option value="Other">Other</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Choose where readers can find the full book
                </p>
              </div>

              {/* Book Link */}
              <div>
                <label className="text-sm font-medium">Book Link (Optional)</label>
                <Input
                  name="book_link"
                  type="url"
                  placeholder="https://www.example.com/book"
                  value={formData.book_link}
                  onChange={handleInputChange}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Direct link to the book on the selected platform
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
                        <div className="w-10 h-14 md:w-12 md:h-16 rounded overflow-hidden flex-shrink-0">
                          <ImageWithFallback
                            src={book.cover_url}
                            alt={book.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-xs md:text-sm truncate max-w-[150px] md:max-w-xs">{book.title}</TableCell>
                      <TableCell className="max-w-xs truncate text-xs md:text-sm">
                        {book.description}
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
