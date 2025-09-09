import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { BookingModal } from './components/BookingModal';
import { ExportModal } from './components/ExportModal';
import { getBookings, addBooking, deleteBooking, updateBooking, getAllBookings } from './services/googleSheetService';
import { STUDIOS } from './constants';
import { getTodayDateString } from './utils/time';
import { convertToCSV, downloadCSV } from './utils/csv';
import type { Booking, NewBooking, ModalData } from './types';

const App: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [modalState, setModalState] = useState<{ isOpen: boolean; data: ModalData | null }>({
    isOpen: false,
    data: null,
  });
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Ref to hold the latest date
  const selectedDateRef = useRef(selectedDate);
  useEffect(() => {
    selectedDateRef.current = selectedDate;
  }, [selectedDate]);

  const fetchBookingsForDate = useCallback(async (date: string) => {
    setIsLoading(true);
    try {
      const fetchedBookings = await getBookings(date);
      setBookings(fetchedBookings);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load bookings when date changes
  useEffect(() => {
    fetchBookingsForDate(selectedDate);
  }, [selectedDate, fetchBookingsForDate]);

  // Polling to sync across users every 10s
  useEffect(() => {
    const interval = setInterval(() => {
      fetchBookingsForDate(selectedDateRef.current);
    }, 10000); // 10 seconds
    return () => clearInterval(interval);
  }, [fetchBookingsForDate]);

  // Sync across tabs (same browser)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'websankul_studio_bookings') {
        console.log('Bookings updated in another tab. Refreshing...');
        fetchBookingsForDate(selectedDateRef.current);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchBookingsForDate]);

  const handleDateChange = (newDate: string) => {
    if (newDate) setSelectedDate(newDate);
  };

  const handleOpenModal = (data: ModalData) => {
    setModalState({ isOpen: true, data });
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, data: null });
  };

  const handleAddBooking = async (newBookingData: NewBooking) => {
    try {
      await addBooking(newBookingData);
      await fetchBookingsForDate(selectedDate);
      handleCloseModal();
      localStorage.setItem('websankul_studio_bookings', Date.now().toString());
    } catch (error) {
      console.error("Failed to add booking:", error);
      alert(error instanceof Error ? error.message : "An unknown error occurred.");
    }
  };

  const handleUpdateBooking = async (updatedBookingData: Booking) => {
    try {
      await updateBooking(updatedBookingData);
      await fetchBookingsForDate(selectedDate);
      handleCloseModal();
      localStorage.setItem('websankul_studio_bookings', Date.now().toString());
    } catch (error) {
      console.error("Failed to update booking:", error);
      alert(error instanceof Error ? error.message : "An unknown error occurred.");
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
      try {
        await deleteBooking(bookingId);
        await fetchBookingsForDate(selectedDate);
        handleCloseModal();
        localStorage.setItem('websankul_studio_bookings', Date.now().toString());
      } catch (error) {
        console.error("Failed to delete booking:", error);
      }
    }
  };

  const handleExportBookings = async (startDate: string, endDate: string) => {
    try {
      const allBookings = await getAllBookings();
      const filteredBookings = allBookings.filter(
        booking => booking.date >= startDate && booking.date <= endDate
      );

      if (filteredBookings.length === 0) {
        alert("No bookings found in the selected date range.");
        return;
      }

      const csvData = convertToCSV(filteredBookings, STUDIOS);
      downloadCSV(csvData, `bookings_${startDate}_to_${endDate}.csv`);
      setIsExportModalOpen(false);
    } catch (error) {
      console.error("Failed to export bookings:", error);
      alert("An error occurred while exporting bookings.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header 
        selectedDate={selectedDate} 
        onDateChange={handleDateChange}
        onOpenExportModal={() => setIsExportModalOpen(true)}
      />
      <main className="p-4 sm:p-6 lg:p-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <Dashboard
            studios={STUDIOS}
            bookings={bookings}
            onOpenModal={handleOpenModal}
          />
        )}
      </main>
      {modalState.isOpen && modalState.data && (
        <BookingModal
          isOpen={modalState.isOpen}
          onClose={handleCloseModal}
          modalData={modalState.data}
          onAddBooking={handleAddBooking}
          onUpdateBooking={handleUpdateBooking}
          onDeleteBooking={handleDeleteBooking}
          selectedDate={selectedDate}
        />
      )}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExportBookings}
      />
    </div>
  );
};

export default App;
