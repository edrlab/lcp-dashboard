import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardFooter } from "@/components/dashboard/DashboardFooter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/lib/apiService";
import { API_CONFIG } from "@/lib/api";
import { Publication } from "@/hooks/useDashboardData";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, ChevronLeft, ChevronRight, Trash2, BookOpen } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const fetchPublications = async (page: number, perPage: number): Promise<Publication[]> => {
  return apiService.get<Publication[]>(API_CONFIG.ENDPOINTS.PUBLICATIONS(page, perPage));
};

const usePublications = (page: number, perPage: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['publications', page, perPage],
    queryFn: () => fetchPublications(page, perPage),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
    enabled: enabled, // Only fetch when auth is loaded
  });
};

export default function Publications() {
  const { isLoading: authLoading, token } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [publicationToDelete, setPublicationToDelete] = useState<Publication | null>(null);
  const [deletingUuids, setDeletingUuids] = useState<Set<string>>(new Set());
  
  const queryClient = useQueryClient();
  // Only fetch when auth is loaded AND token is available
  const { data: publications, isLoading, error } = usePublications(currentPage, perPage, !authLoading && !!token);

  // Ensure publications is always an array
  const publicationList = Array.isArray(publications) ? publications : [];

  const handleDeleteClick = (publication: Publication) => {
    setPublicationToDelete(publication);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!publicationToDelete) return;

    const uuid = publicationToDelete.uuid;
    setDeletingUuids(prev => new Set(prev).add(uuid));
    setDeleteDialogOpen(false);

    try {
      await apiService.delete(API_CONFIG.ENDPOINTS.DELETE_PUBLICATION(uuid));
      toast({
        title: "Success",
        description: "Publication deleted successfully",
        className: "bg-success/20 border-success/30",
      });
      
      // Invalidate and refetch publications
      queryClient.invalidateQueries({ queryKey: ['publications'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete publication",
        variant: "destructive",
      });
    } finally {
      setDeletingUuids(prev => {
        const newSet = new Set(prev);
        newSet.delete(uuid);
        return newSet;
      });
      setPublicationToDelete(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="container mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link to="/dashboard">
              <Button variant="outline" size="icon" className="shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Publications</h1>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        </main>
        <DashboardFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="container mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link to="/dashboard">
              <Button variant="outline" size="icon" className="shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Publications</h1>
          </div>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load publications. Please try again later.
            </AlertDescription>
          </Alert>
        </main>
        <DashboardFooter />
      </div>
    );
  }

  const hasPreviousPage = currentPage > 1;
  const hasNextPage = Array.isArray(publicationList) && publicationList.length === perPage;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="outline" size="icon" className="shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Publications</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Items per page:</span>
            <Button
              variant={perPage === 10 ? "default" : "outline"}
              size="sm"
              onClick={() => handlePerPageChange(10)}
            >
              10
            </Button>
            <Button
              variant={perPage === 20 ? "default" : "outline"}
              size="sm"
              onClick={() => handlePerPageChange(20)}
            >
              20
            </Button>
          </div>
        </div>
        
        <div className="space-y-4 mb-6">
          {publicationList.length === 0 ? (
            <Card className="p-12 flex flex-col items-center justify-center text-center bg-gradient-card border-stat-border">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No publications found</h3>
              <p className="text-muted-foreground max-w-md">
                There are currently no publications in the system.
              </p>
            </Card>
          ) : (
            publicationList.map((publication) => {
              const isDeleting = deletingUuids.has(publication.uuid);
              
              return (
                <Card 
                  key={publication.uuid} 
                  className={`p-6 bg-gradient-card border-stat-border hover:shadow-lg transition-all duration-300 ${isDeleting ? 'opacity-50' : ''}`}
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Cover Image */}
                    {publication.cover_url && (
                      <div className="flex-shrink-0">
                        <img
                          src={publication.cover_url}
                          alt={publication.title}
                          className="w-24 h-32 object-cover rounded shadow-md"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    {/* Content */}
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">
                          {publication.title}
                        </h3>
                        
                        {publication.authors && (
                          <p className="text-sm text-muted-foreground mb-2">
                            by {publication.authors}
                          </p>
                        )}
                        
                        {publication.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {publication.description}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1 text-xs">
                        <div className="text-muted-foreground">
                          <span className="font-medium">UUID:</span> {publication.uuid}
                        </div>
                        
                        {publication.alt_id && (
                          <div className="text-muted-foreground">
                            <span className="font-medium">Alt ID:</span> {publication.alt_id}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 items-center">
                        <Badge variant="secondary" className="text-xs">
                          {publication.content_type === 'application/epub+zip' ? 'EPUB' : 
                           publication.content_type === 'application/pdf' ? 'PDF' : 
                           publication.content_type}
                        </Badge>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex md:flex-col gap-2 md:justify-start">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClick(publication)}
                        disabled={isDeleting}
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {publicationList.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Page {currentPage}
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!hasPreviousPage}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!hasNextPage}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </main>
      
      <DashboardFooter />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Publication</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{publicationToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
