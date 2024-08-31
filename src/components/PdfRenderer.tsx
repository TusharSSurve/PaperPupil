"use client";
import { useToast } from '@/hooks/use-toast';
import { ChevronDown, ChevronUp, Loader2, RotateCw, Search } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useResizeDetector } from 'react-resize-detector'
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import SimpleBar from 'simplebar-react';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs'


type PDfRendererProps = {
  url: string
}

export default function PdfRenderer({ url }: PDfRendererProps) {
  const { toast } = useToast();
  const [numPages, setNumPages] = useState<number>();
  const [currPage, setCurrPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0)
  const [renderedScale, setRenderedScale] = useState<number | null>(null);

  const isLoading = renderedScale !== scale

  const CustomPageValidator = z.object({
    page: z.string().refine(num => Number(num) > 0 && Number(num) <= numPages!)
  })

  type TCustomePageValidator = z.infer<typeof CustomPageValidator>;
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<TCustomePageValidator>({
    defaultValues: {
      page: "1"
    },
    resolver: zodResolver(CustomPageValidator)
  })

  const { width, ref } = useResizeDetector();

  const handlePageSubmit = ({ page }: TCustomePageValidator) => {
    setCurrPage(Number(page));
    setValue("page", String(page))
  }
  return (
    <div className="w-full bg-white rounded-md shadow flex flex-col items-center">
      <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
        <div className="flex items-center gap-1.5">
          <Button variant='ghost' onClick={() => {
            setCurrPage(prev => (prev - 1 > 1 ? prev - 1 : 1));
            setValue("page", String(currPage - 1))
          }} disabled={currPage <= 1} aria-label='previous page'>
            <ChevronDown className='h-4 w-4' />
          </Button>
          <div className='flex items-center gap-1.5'>
            <Input {...register("page")} className={cn('w-12 h-8', errors.page && "focus-visible:ring-red-500")} type='number' onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit(handlePageSubmit)()
              }
            }} />
            <p className='text-zinc-700 text-sm space-x-1'>
              <span>/</span>
              <span>{numPages ?? 'x'}</span>
            </p>
          </div>
          <Button variant='ghost' aria-label='next page' onClick={() => {
            setCurrPage(prev => (prev + 1 > numPages! ? numPages! : prev + 1))
            setValue("page", String(currPage + 1))
          }} disabled={numPages === undefined || currPage === numPages} >
            <ChevronUp className='h-4 w-4' />
          </Button>
        </div>
        <div className='space-x-2'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-label='zoom' variant='ghost' className='gap-1.5'>
                <Search className='h-4 w-4' />
                {scale * 100}%<ChevronDown className='h-3 w-3 opacity-50' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setScale(0.8)}>80%</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(1)}>100%</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(1.2)}>120%</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(1.4)}>140%</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button aria-label='rotate 90 degrees' variant='ghost' onClick={() => setRotation(prev => prev + 90)}>
            <RotateCw className='h-4 w-4' />
          </Button>
        </div>
      </div>
      <div className="flex-1 w-full max-h-screen ">
        <SimpleBar autoHide={false} className='max-h-[calc(100vh-10rem)]'>
          <div ref={ref}>
            <Document file={url} loading={
              <div className='flex justify-center'>
                <Loader2 className='my-24 h-6 w-6 animate-spin' />
              </div>
            } onLoadError={() => {
              return toast({
                title: 'Error Loading PDF',
                description: 'Please try again later',
                variant: 'destructive'
              })
            }} onLoadSuccess={({ numPages }) => {
              setNumPages(numPages)
            }}
              className='max-h-full'>
              {isLoading && renderedScale ? <Page width={width ? width : 1} pageNumber={currPage} scale={scale} rotate={rotation} key={"@" + renderedScale} /> : null}

              <Page className={cn(isLoading ? 'hidden' : '')} width={width ? width : 1} pageNumber={currPage} scale={scale} rotate={rotation} loading={
                <div className='flex justify-center'>
                  <Loader2 className='my-24 h-6 w-6 animate-spin' />
                </div>
              } onRenderSuccess={() => setRenderedScale(scale)} key={"@" + scale} />
            </Document>
          </div>
        </SimpleBar>
      </div>
    </div>
  )
}
