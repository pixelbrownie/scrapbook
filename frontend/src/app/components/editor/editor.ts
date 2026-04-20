import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZineService } from '../../services/zine';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './editor.html',
  styleUrl: './editor.css'
})
export class EditorComponent implements OnInit {
  zineId: number | null = null;
  pages = [
    { id: 'page4', label: '4', rotated: true, preview: null },
    { id: 'page3', label: '3', rotated: true, preview: null },
    { id: 'page2', label: '2', rotated: true, preview: null },
    { id: 'page1', label: '1', rotated: true, preview: null },
    { id: 'page5', label: '5', rotated: false, preview: null },
    { id: 'page6', label: '6', rotated: false, preview: null },
    { id: 'page_back', label: 'Back', rotated: false, preview: null },
    { id: 'page_cover', label: 'Cover', rotated: false, preview: null },
  ];

  constructor(private zineService: ZineService) {}

  ngOnInit() {
    // For Phase 1 refinement, we'll create a zine immediately
    this.createInitialZine();
  }

  createInitialZine() {
    this.zineService.createZine({ title: 'My Awesome Zine' }).subscribe(res => {
      this.zineId = res.id;
    });
  }

  triggerUpload(index: number) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file && this.zineId) {
        // 1. Instant Local Preview (Front-end speed)
        const localUrl = URL.createObjectURL(file);
        this.pages[index].preview = localUrl as any;

        // 2. Background Upload (Consistency)
        const fieldName = this.pages[index].id;
        this.zineService.updatePage(this.zineId, fieldName, file).subscribe({
          next: (res) => {
            console.log(`Page ${fieldName} uploaded successfully`);
            // Optionally update with the real backend URL, but localUrl is fine for now
            // URL.revokeObjectURL(localUrl); // Cleanup if needed later
          },
          error: (err) => console.error('Upload failed', err)
        });
      }
    };
    fileInput.click();
  }
}
