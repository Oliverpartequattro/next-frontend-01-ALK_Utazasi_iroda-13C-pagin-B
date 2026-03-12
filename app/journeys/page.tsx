'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './journeys.module.css';

interface Vehicle {
  id: number;
  type: string;
}

interface Journey {
  id: number;
  vehicle: Vehicle;
  country: string;
  description: string;
  departure: string;
  capacity: number;
  pictureUrl: string;
}

const ITEMS_PER_PAGE = 2;
const API_BASE = 'http://localhost:3000';

export default function JourneysPage() {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [filteredJourneys, setFilteredJourneys] = useState<Journey[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch data based on current page and search term
  useEffect(() => {
    const fetchJourneys = async () => {
      setLoading(true);
      try {
        const filter = searchTerm.trim() === '' ? '*' : searchTerm.trim();
        const response = await fetch(
          `${API_BASE}/api/journeys/${currentPage}/${ITEMS_PER_PAGE}/${filter}`,
          { cache: 'no-store' }
        );
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        const numRecords = response.headers.get('number-of-records');
        
        setJourneys(Array.isArray(data) ? data : []);
        setTotalRecords(parseInt(numRecords || '0', 10));
      } catch (error) {
        console.error('Hiba az adatok letöltésekor:', error);
        setJourneys([]);
        setTotalRecords(0);
      } finally {
        setLoading(false);
      }
    };

    fetchJourneys();
  }, [currentPage, searchTerm]);

  const totalPages = Math.ceil(totalRecords / ITEMS_PER_PAGE);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const goToFirstPage = () => setCurrentPage(1);
  const goToPreviousPage = () => setCurrentPage(Math.max(1, currentPage - 1));
  const goToNextPage = () => setCurrentPage(Math.min(totalPages, currentPage + 1));
  const goToLastPage = () => setCurrentPage(totalPages);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Utazási ajánlatok</h1>

      {/* Search Bar */}
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Keress utazási ajánlatban..."
          value={searchTerm}
          onChange={handleSearch}
          className={styles.searchInput}
        />
      </div>

      {/* Journey Cards */}
      <div className={styles.journeysGrid}>
        {loading ? (
          <div className={styles.loading}>Betöltés...</div>
        ) : journeys.length > 0 ? (
          journeys.map((journey) => (
            <div key={journey.id} className={styles.journeyCard}>
              <div className={styles.cardImage}>
                <Image
                  src={journey.pictureUrl}
                  alt={journey.country}
                  fill
                  className={styles.image}
                />
              </div>
              <div className={styles.cardContent}>
                <h2 className={styles.cardTitle}>{journey.country}</h2>
                <p className={styles.cardMeta}>
                  <strong>Indulás:</strong> {new Date(journey.departure).toLocaleDateString('hu-HU')}
                </p>
                <p className={styles.cardMeta}>
                  <strong>Jármű:</strong> {journey.vehicle.type}
                </p>
                <p className={styles.cardMeta}>
                  <strong>Kapacitás:</strong> {journey.capacity} fő
                </p>
                <p className={styles.cardDescription}>{journey.description}</p>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.noResults}>Nincs találat</div>
        )}
      </div>

      {/* Pagination */}
      <div className={styles.pagination}>
        <button
          onClick={goToFirstPage}
          disabled={currentPage === 1 || totalPages === 0}
          className={styles.paginationButton}
        >
          Első
        </button>
        <button
          onClick={goToPreviousPage}
          disabled={currentPage === 1 || totalPages === 0}
          className={styles.paginationButton}
        >
          Előző
        </button>

        <span className={styles.pageInfo}>
          {totalPages === 0 ? 'Nincs adat' : `${currentPage} / ${totalPages}`}
        </span>

        <button
          onClick={goToNextPage}
          disabled={currentPage === totalPages || totalPages === 0}
          className={styles.paginationButton}
        >
          Következő
        </button>
        <button
          onClick={goToLastPage}
          disabled={currentPage === totalPages || totalPages === 0}
          className={styles.paginationButton}
        >
          Utolsó
        </button>
      </div>
    </div>
  );
}
