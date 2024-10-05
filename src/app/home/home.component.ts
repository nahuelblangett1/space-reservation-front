import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router'; // Importa el Router



interface Space {
  id: number;
  name: string;
  type: string;
  capacity: number;
  startDate: string;
  endDate: string;
  description: string;
  unavailableTimes: string[];
  reservations: Reservation[];
  photo: string;
}

interface Reservation {
  id: number;
  space_id: number;
  start_time: string; // Horario de inicio
  end_time: string; // Horario de fin
}

interface User {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
}


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  filteredSpaces: Space[] = [];
  selectedSpaceType: string = '';
  selectedCapacity: number | null = null;
  selectedStartDate: string = '';
  allSpaces: Space[] = [];
  newSpace: Space = {
    id: 0,
    name: '',
    type: '',
    capacity: 0,
    startDate: '',
    endDate: '',
    description: '',
    unavailableTimes: [],
    reservations: [],
    photo: '',
  };
  
  selectedSpace: Space = {
    id: 0,
    name: '',
    type: '',
    capacity: 0,
    startDate: '',
    endDate: '',
    description: '',
    unavailableTimes: [],
    reservations: [],
    photo: '',
  };
  user: User | null = null;
  isEditing: boolean = false;
  isModalOpen: boolean = false;
  isCreateModalOpen: boolean = false;




  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.getSpaces();
    this.getUser();
    this.loadSpaces(); 
  }

  getUser(): void {
    this.apiService.getUser().subscribe({
      next: (user) => {
        this.user = user;
      }
    });
  }

  getSpaces(): void {
    this.apiService.getItems().subscribe({
      next: (spaces) => {
        this.filteredSpaces = spaces;
      },
      error: (error) => {
        console.error('Error al obtener los espacios:', error);
      }
    });
  } 

  loadSpaces() {
    // Carga tus espacios desde la API o desde donde sea necesario
    this.apiService.getItems().subscribe(spaces => {
      this.allSpaces = spaces; // Guarda los espacios originales
      this.filteredSpaces = [...this.allSpaces]; // Inicializa filteredSpaces con una copia de allSpaces
    });
  }


  onFilterSubmit(event: Event): void {
    event.preventDefault();

    // Reinicia los espacios filtrados a todos los espacios originales antes de filtrar
    this.filteredSpaces = [...this.allSpaces];

    this.filteredSpaces = this.filteredSpaces.filter((space: Space) => {
        const isTypeMatch = space.type === this.selectedSpaceType || !this.selectedSpaceType;

        const isCapacityMatch = !this.selectedCapacity || (space.capacity && space.capacity == this.selectedCapacity);


        const spaceStartDate = new Date(space.startDate);
        const selectedStartDate = new Date(this.selectedStartDate);
        console.log(spaceStartDate, selectedStartDate);
        const isDateMatch = !this.selectedStartDate || spaceStartDate.getTime() === selectedStartDate.getTime();

        return isTypeMatch && isCapacityMatch && isDateMatch;
    });
  } 

  

 
  getOccupiedTimes(space: Space): string[] {
    const occupiedTimes: { [date: string]: { start: string; end: string }[] } = {};

    space.reservations.forEach(reservation => {
      const startDate = new Date(reservation.start_time);
      const endDate = new Date(reservation.end_time);


      const dateString = `${startDate.getMonth() + 1}/${startDate.getDate()}/${startDate.getFullYear()}`;
      

      const startTime = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
      const endTime = endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

      if (!occupiedTimes[dateString]) {
        occupiedTimes[dateString] = [];
      }
      occupiedTimes[dateString].push({ start: startTime, end: endTime });
    });


    const formattedOccupiedTimes: string[] = [];
    for (const date in occupiedTimes) {
      const timeRanges = occupiedTimes[date];
      

      if (timeRanges.length > 1) {

        const startRange = timeRanges[0].start;
        const endRange = timeRanges[timeRanges.length - 1].end; 
        formattedOccupiedTimes.push(`${date}, ${startRange} - ${endRange}`);
      } else {
        formattedOccupiedTimes.push(`${date}, ${timeRanges[0].start} - ${timeRanges[0].end}`);
      }
    }

    return formattedOccupiedTimes;
  }


  // Calcular horarios disponibles
  getAvailableTimes(space: Space): string[] {
    const allTimes = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"];
    
    const occupiedTimes = this.getOccupiedTimes(space);
    

    const unavailableTimes = [...new Set(occupiedTimes)];


    const availableTimes = allTimes.filter(time => !unavailableTimes.includes(time));

    return availableTimes;
  }


  openModal(space: Space): void {
    this.selectedSpace = space;
    this.isModalOpen = true;

    const availableTimes = this.getAvailableTimes(space);
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedSpace = {
      id: 0,
      name: '',
      type: '',
      capacity: 0,
      startDate: '',
      endDate: '',
      description: '',
      unavailableTimes: [],
      reservations: [],
      photo: '',
    };
  }


  
  selectSpace(space: Space): void {
    this.selectedSpace = space;
  }
  

  
  editSpace(space: any) {
    this.selectedSpace = { ...space };
    this.isEditing = true;
  }

  typeSpaces(type: string): string {
    if (type === 'meeting_room') {
      return 'Sala de reuniones';
    } else if (type === 'office') {
      return 'Oficina';
    } else if (type === 'coworking') {
      return 'Coworking';
    }
    return type; // Devuelve el tipo original si no coincide con ninguna condición
  }

  closeEditModal() {
    this.isEditing = false;
  }

  openCreateModal() {
    this.isCreateModalOpen = true;
  }
  
  closeCreateModal() {
    this.isCreateModalOpen = false;
  }

  // Funciones para crear, editar y eliminar espacios

  createSpace(space: Space) {
    this.apiService.createSpace(space).subscribe({
      next: () => {
        this.closeCreateModal();
        this.getSpaces();
        this.router.navigate(['/']).then(() => {
          location.reload();
        });
        this.newSpace = {id: 0, name: '', type: '', capacity: 0, startDate: '', endDate: '', description: '', unavailableTimes: [], reservations: [], photo: '' };
      },
      error: (error) => {
        console.error('Error al crear el espacio:', error);
      }
    });
  }
  
  updateSpace(space: Space) {
    this.apiService.editSpace(space.id, space).subscribe({
      next: () => {
        this.closeEditModal(); // Cerrar el modal después de guardar
        this.getSpaces(); // Opcionalmente, volver a obtener la lista de espacios
      },
      error: (error) => {
        console.error('Error al editar el espacio:', error);
      }
    });
  }

  deleteSpace(space: any) {
    this.apiService.deleteSpace(space.id).subscribe({
      next: () => {
        this.getSpaces();
      },
      error: (error) => {
        console.error('Error al eliminar el espacio:', error);
      }
    });
  }

}