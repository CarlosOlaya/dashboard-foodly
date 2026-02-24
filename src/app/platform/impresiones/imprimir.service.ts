import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor(private http: HttpClient) { }

  descargarPDF(): Observable<Blob> {
    const options = { responseType: 'blob' as 'json' };
    return this.http.post<Blob>('URL_DEL_SERVIDOR/ENDPOINT_PARA_DESCARGAR_PDF', {}, options);
  }
}
