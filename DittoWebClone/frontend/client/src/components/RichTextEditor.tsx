import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Youtube from '@tiptap/extension-youtube'
import Link from '@tiptap/extension-link'
import TextStyle from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import { Extension } from '@tiptap/core'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Youtube as YoutubeIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Palette,
  Highlighter,
  Type,
  Upload,
  Table as TableIcon,
  Plus,
  Minus
} from 'lucide-react'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

// Word-like text sizes for professional documents
const textSizes = [
  { label: '8', value: '8px' },
  { label: '9', value: '9px' },
  { label: '10', value: '10px' },
  { label: '11', value: '11px' },
  { label: '12', value: '12px' },
  { label: '14', value: '14px' },
  { label: '16', value: '16px' },
  { label: '18', value: '18px' },
  { label: '20', value: '20px' },
  { label: '22', value: '22px' },
  { label: '24', value: '24px' },
  { label: '26', value: '26px' },
  { label: '28', value: '28px' },
  { label: '36', value: '36px' },
  { label: '48', value: '48px' },
  { label: '72', value: '72px' },
]

// Common colors for quick selection
const quickColors = [
  '#000000', '#374151', '#6B7280', '#9CA3AF',
  '#DC2626', '#EA580C', '#D97706', '#CA8A04',
  '#65A30D', '#16A34A', '#059669', '#0D9488',
  '#0891B2', '#0284C7', '#2563EB', '#4F46E5',
  '#7C3AED', '#9333EA', '#C026D3', '#DB2777',
]

export default function RichTextEditor({ content, onChange, placeholder = "Start writing..." }: RichTextEditorProps) {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
  const [isYoutubeDialogOpen, setIsYoutubeDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageAltText, setImageAltText] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [selectedColor, setSelectedColor] = useState('#000000')
  const [selectedFontSize, setSelectedFontSize] = useState('')
  const [uploadedFileName, setUploadedFileName] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isTableDialogOpen, setIsTableDialogOpen] = useState(false)
  const [tableRows, setTableRows] = useState(3)
  const [tableCols, setTableCols] = useState(3)

  const detectCurrentFontSize = (editor: any) => {
    if (!editor) return
    
    const { state } = editor
    const { from } = state.selection
    const marks = state.doc.resolve(from).marks()
    
    // Find text style mark with fontSize
    const textStyleMark = marks.find((mark: any) => 
      mark.type.name === 'textStyle' && mark.attrs.fontSize
    )
    
    if (textStyleMark && textStyleMark.attrs.fontSize) {
      setSelectedFontSize(textStyleMark.attrs.fontSize)
    } else {
      setSelectedFontSize('')
    }
  }

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            class: 'my-4',
          },
        },
        heading: {
          HTMLAttributes: {
            class: 'my-6 font-bold',
          },
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'my-4 rounded-lg shadow-md max-w-full h-auto',
        },
      }),
      Youtube.configure({
        width: 640,
        height: 480,
        HTMLAttributes: {
          class: 'my-6 rounded-lg shadow-md',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 underline',
        },
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Table.configure({
        resizable: true,
        handleWidth: 5,
        cellMinWidth: 50,
        HTMLAttributes: {
          class: 'table-auto border-collapse border border-gray-300 w-full my-4',
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'border border-gray-300',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 bg-gray-50 font-semibold p-2 text-left',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 p-2 min-w-[100px] min-h-[40px] resize',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
      detectCurrentFontSize(editor)
    },
    onSelectionUpdate: ({ editor }) => {
      detectCurrentFontSize(editor)
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4',
      },
    },
  })

  if (!editor) {
    return null
  }

  const addLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run()
      setLinkUrl('')
      setIsLinkDialogOpen(false)
    }
  }

  const addImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ 
        src: imageUrl, 
        alt: imageAltText || 'Image'
      }).run()
      resetImageDialog()
    }
  }

  const resetImageDialog = () => {
    setImageUrl('')
    setImageAltText('')
    setUploadedFileName('')
    setSelectedFile(null)
    setIsImageDialogOpen(false)
    // Reset file input
    const fileInput = document.getElementById('imageFile') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const cancelSelectedFile = () => {
    setSelectedFile(null)
    setUploadedFileName('')
    setImageUrl('')
    const fileInput = document.getElementById('imageFile') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file.')
        return
      }
      
      // Increased file size limit to 100MB for large blog images
      if (file.size > 100 * 1024 * 1024) {
        alert('File size too large. Please choose an image under 100MB.')
        return
      }
      
      // Clear URL field when uploading file
      setImageUrl('')
      setSelectedFile(file)
      setUploadedFileName(file.name)
      
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setImageUrl(result)
      }
      reader.onerror = () => {
        alert('Error reading file. Please try again.')
        setUploadedFileName('')
        setSelectedFile(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUrlChange = (url: string) => {
    setImageUrl(url)
    if (url.trim()) {
      // Clear file upload when entering URL
      setUploadedFileName('')
      const fileInput = document.getElementById('imageFile') as HTMLInputElement
      if (fileInput) {
        fileInput.value = ''
      }
    }
  }

  const insertTable = () => {
    editor.chain().focus().insertTable({ 
      rows: tableRows, 
      cols: tableCols, 
      withHeaderRow: true 
    }).run()
    setIsTableDialogOpen(false)
  }

  const addYoutubeVideo = () => {
    if (youtubeUrl) {
      editor.commands.setYoutubeVideo({
        src: youtubeUrl,
        width: 640,
        height: 480,
      })
      setYoutubeUrl('')
      setIsYoutubeDialogOpen(false)
    }
  }

  const MenuBar = () => {
    return (
      <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1 bg-gray-50">
        {/* Text Formatting */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <Button
            variant={editor.isActive('bold') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive('italic') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive('underline') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive('strike') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive('code') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleCode().run()}
          >
            <Code className="h-4 w-4" />
          </Button>
        </div>

        {/* Headings */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <Button
            variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            <Heading3 className="h-4 w-4" />
          </Button>
        </div>

        {/* Lists */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <Button
            variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote className="h-4 w-4" />
          </Button>
        </div>

        {/* Text Alignment */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <Button
            variant={editor.isActive({ textAlign: 'left' }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive({ textAlign: 'center' }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive({ textAlign: 'right' }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive({ textAlign: 'justify' }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          >
            <AlignJustify className="h-4 w-4" />
          </Button>
        </div>

        {/* Text Size */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <select
            className="text-sm border border-gray-300 rounded px-2 py-1 min-w-[60px]"
            value={selectedFontSize}
            onChange={(e) => {
              const size = e.target.value;
              setSelectedFontSize(size);
              if (size) {
                // Apply font size to selected text or at cursor position
                editor.chain().focus().setMark('textStyle', { fontSize: size }).run();
              } else {
                // Remove font size styling
                editor.chain().focus().unsetMark('textStyle').run();
              }
            }}
          >
            <option value="">Size</option>
            {textSizes.map((size) => (
              <option key={size.value} value={size.value}>
                {size.label}
              </option>
            ))}
          </select>
        </div>

        {/* Text Color & Highlight */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          {/* Text Color Picker */}
          <div className="relative group">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1"
            >
              <div 
                className="w-4 h-4 rounded border border-gray-400"
                style={{ backgroundColor: selectedColor }}
              />
              <Type className="h-3 w-3" />
            </Button>
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20 min-w-[200px]">
              <div className="text-xs font-medium text-gray-700 mb-2">Text Color</div>
              <div className="grid grid-cols-6 gap-1 mb-3">
                {quickColors.map((color) => (
                  <button
                    key={color}
                    className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform relative hover:shadow-md"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      setSelectedColor(color);
                      editor.chain().focus().setColor(color).run();
                    }}
                    title={color}
                  >
                    {selectedColor === color && (
                      <div className="absolute inset-0 border-2 border-blue-500 rounded"></div>
                    )}
                  </button>
                ))}
              </div>
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => {
                  setSelectedColor(e.target.value);
                  editor.chain().focus().setColor(e.target.value).run();
                }}
                className="w-full h-8 border border-gray-300 rounded cursor-pointer"
                title="Custom Color"
              />
              <div className="text-xs text-gray-500 mt-1">Click a color or use custom picker</div>
            </div>
          </div>

          {/* Highlight/Marker Color Picker */}
          <div className="relative group">
            <Button
              variant={editor.isActive('highlight') ? 'default' : 'ghost'}
              size="sm"
              className="flex items-center gap-1"
            >
              <Highlighter className="h-4 w-4" />
            </Button>
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20 min-w-[200px]">
              <div className="text-xs font-medium text-gray-700 mb-2">Highlight Color</div>
              <div className="grid grid-cols-5 gap-1 mb-3">
                {['#FFE066', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE'].map((color) => (
                  <button
                    key={color}
                    className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform hover:shadow-md"
                    style={{ backgroundColor: color }}
                    onClick={() => editor.chain().focus().toggleHighlight({ color }).run()}
                    title={`Highlight with ${color}`}
                  />
                ))}
              </div>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleHighlight().run()}
                  className="w-full text-xs"
                >
                  {editor.isActive('highlight') ? 'Remove Highlight' : 'Add Yellow Highlight'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => editor.chain().focus().unsetHighlight().run()}
                  className="w-full text-xs"
                >
                  Clear All Highlights
                </Button>
              </div>
              <div className="text-xs text-gray-500 mt-1">Click to highlight selected text</div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <Dialog open={isTableDialogOpen} onOpenChange={setIsTableDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" title="Insert Table">
                <TableIcon className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Insert Table</DialogTitle>
                <p className="text-sm text-gray-600">Create a table with custom rows and columns</p>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tableRows">Rows</Label>
                    <Input
                      id="tableRows"
                      type="number"
                      min="1"
                      max="20"
                      value={tableRows}
                      onChange={(e) => setTableRows(parseInt(e.target.value) || 1)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tableCols">Columns</Label>
                    <Input
                      id="tableCols"
                      type="number"
                      min="1"
                      max="10"
                      value={tableCols}
                      onChange={(e) => setTableCols(parseInt(e.target.value) || 1)}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600 mb-2">Preview: {tableRows} × {tableCols} table</p>
                  <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${Math.min(tableCols, 5)}, 1fr)` }}>
                    {Array.from({ length: Math.min(tableRows * tableCols, 25) }).map((_, i) => (
                      <div key={i} className="w-6 h-4 bg-white border border-gray-300 rounded-sm"></div>
                    ))}
                    {tableCols > 5 && <div className="text-xs text-gray-500">...</div>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsTableDialogOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={insertTable} className="flex-1">
                    Insert Table
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().addRowAfter().run()}
            disabled={!editor.isActive('table')}
            title="Add Row"
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().deleteRow().run()}
            disabled={!editor.isActive('table')}
            title="Delete Row"
          >
            <Minus className="h-3 w-3" />
          </Button>
        </div>

        {/* Media */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <LinkIcon className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Link</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="linkUrl">URL</Label>
                  <Input
                    id="linkUrl"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
                <Button onClick={addLink} className="w-full">
                  Add Link
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog 
            open={isImageDialogOpen} 
            onOpenChange={(open) => {
              if (!open) {
                resetImageDialog()
              }
            }}
            modal={true}
          >
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setIsImageDialogOpen(true)
                }}
                className="hover:bg-gray-100 focus:bg-gray-100"
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold">Add Image</DialogTitle>
                <p className="text-sm text-gray-600">Upload an image file or provide a URL</p>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* File Upload Section */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Upload Image File</Label>
                  <div 
                    className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
                      uploadedFileName 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      id="imageFile"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="text-center">
                      <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      {uploadedFileName ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-center gap-2">
                            <p className="text-sm font-medium text-green-700">{uploadedFileName}</p>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                cancelSelectedFile()
                              }}
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-green-600">File uploaded successfully</p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-700">Drop image here or click to browse</p>
                          <p className="text-xs text-gray-500">Supports JPG, PNG, GIF up to 100MB</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">or</span>
                  </div>
                </div>

                {/* URL Section */}
                <div className="space-y-3">
                  <Label htmlFor="imageUrl" className="text-sm font-medium">Image URL</Label>
                  <Input
                    id="imageUrl"
                    value={uploadedFileName ? '' : imageUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    disabled={!!uploadedFileName}
                    className="w-full"
                  />
                  {uploadedFileName && (
                    <p className="text-xs text-gray-500">Clear the uploaded file to use URL instead</p>
                  )}
                </div>

                {/* Alt Text Section */}
                <div className="space-y-3">
                  <Label htmlFor="imageAlt" className="text-sm font-medium">
                    Alt Text <span className="text-gray-400">(for accessibility)</span>
                  </Label>
                  <div onClick={(e) => e.stopPropagation()}>
                    <textarea
                      id="imageAlt"
                      value={imageAltText}
                      onChange={(e) => setImageAltText(e.target.value)}
                      placeholder="Describe what the image shows for screen readers"
                      className="w-full p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      style={{ 
                        fontSize: '16px',
                        fontFamily: 'system-ui, sans-serif',
                        lineHeight: '1.5'
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Help visually impaired users understand your image content
                  </p>
                </div>

                {/* Preview Section */}
                {imageUrl && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Preview</Label>
                    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                      <img 
                        src={imageUrl} 
                        alt={imageAltText || "Image preview"} 
                        className="max-w-full max-h-48 mx-auto object-contain rounded"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          e.currentTarget.nextElementSibling?.classList.remove('hidden')
                        }}
                      />
                      <div className="hidden text-center py-8 text-gray-500">
                        <p className="text-sm">Failed to load image</p>
                        <p className="text-xs">Please check the URL or try a different image</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={resetImageDialog} 
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={addImage} 
                    className="flex-1" 
                    disabled={!imageUrl || !imageAltText.trim()}
                  >
                    Add Image
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isYoutubeDialogOpen} onOpenChange={setIsYoutubeDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <YoutubeIcon className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Embed YouTube Video</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="youtubeUrl">YouTube URL</Label>
                  <Input
                    id="youtubeUrl"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
                <Button onClick={addYoutubeVideo} className="w-full">
                  Embed Video
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Undo/Redo */}
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
      <MenuBar />
      <div className="p-6">
        <EditorContent 
          editor={editor} 
          className="prose prose-lg max-w-none min-h-[500px] focus:outline-none"
          style={{
            fontSize: '16px',
            lineHeight: '1.7',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}
        />
      </div>
    </div>
  )
}