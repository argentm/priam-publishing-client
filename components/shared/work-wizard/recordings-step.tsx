'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ArrowLeft, ArrowRight, Plus, Trash2, Search, Radio, AlertCircle } from 'lucide-react';
import type { RecordingsStepProps, Track } from './types';

export function RecordingsStep({
  linkedTracks,
  onLinkedTracksChange,
  existingTracks,
  loadingTracks,
  onCreateTrack,
  onBack,
  onNext,
}: RecordingsStepProps) {
  const [trackSearch, setTrackSearch] = useState('');
  const [showNewTrackDialog, setShowNewTrackDialog] = useState(false);
  const [creatingTrack, setCreatingTrack] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null);
  const [newTrackData, setNewTrackData] = useState({
    title: '',
    isrc: '',
    artist: '',
  });

  // Filter tracks based on search (exclude already linked)
  const filteredTracks = useMemo(() => {
    if (!trackSearch.trim()) return [];
    const query = trackSearch.toLowerCase();
    return existingTracks.filter(
      (t) =>
        !linkedTracks.find((lt) => lt.id === t.id) &&
        (t.title.toLowerCase().includes(query) ||
          t.isrc?.toLowerCase().includes(query) ||
          t.artist?.toLowerCase().includes(query))
    );
  }, [existingTracks, linkedTracks, trackSearch]);

  // Check for duplicate ISRC
  const isDuplicateIsrc = useMemo(() => {
    if (!newTrackData.isrc.trim()) return false;
    const isrc = newTrackData.isrc.trim().toUpperCase();
    return existingTracks.some((t) => t.isrc?.toUpperCase() === isrc);
  }, [newTrackData.isrc, existingTracks]);

  // Add track to linked tracks
  const addTrack = (track: Track) => {
    onLinkedTracksChange([...linkedTracks, track]);
    setTrackSearch('');
  };

  // Remove track from linked tracks
  const removeTrack = (trackId: string) => {
    onLinkedTracksChange(linkedTracks.filter((t) => t.id !== trackId));
  };

  // Create new track and add to linked tracks
  const handleAddNewTrack = async () => {
    if (!newTrackData.title.trim() || !newTrackData.isrc.trim()) return;

    setCreatingTrack(true);
    setTrackError(null);

    try {
      const createdTrack = await onCreateTrack({
        title: newTrackData.title.trim(),
        isrc: newTrackData.isrc.trim().toUpperCase(),
        artist: newTrackData.artist.trim() || undefined,
      });

      // Add the newly created track to linked tracks
      onLinkedTracksChange([...linkedTracks, createdTrack]);
      setShowNewTrackDialog(false);
      setNewTrackData({ title: '', isrc: '', artist: '' });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create track';
      setTrackError(errorMessage);
    } finally {
      setCreatingTrack(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Link Recordings</CardTitle>
          <CardDescription>
            Link existing tracks/recordings to this work. This step is optional - you can skip it if
            no recordings exist yet.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search tracks */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tracks by title, ISRC, or artist..."
                value={trackSearch}
                onChange={(e) => setTrackSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog open={showNewTrackDialog} onOpenChange={setShowNewTrackDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  New Track
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Track</DialogTitle>
                  <DialogDescription>
                    Create a new track/recording. It will be added to your account and linked to this work.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>
                      Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={newTrackData.title}
                      onChange={(e) =>
                        setNewTrackData((prev) => ({ ...prev, title: e.target.value }))
                      }
                      placeholder="Track title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      ISRC <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={newTrackData.isrc}
                      onChange={(e) =>
                        setNewTrackData((prev) => ({ ...prev, isrc: e.target.value.toUpperCase() }))
                      }
                      placeholder="e.g., USRC17607839"
                    />
                    <p className="text-xs text-muted-foreground">
                      International Standard Recording Code (12 characters)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Artist</Label>
                    <Input
                      value={newTrackData.artist}
                      onChange={(e) =>
                        setNewTrackData((prev) => ({ ...prev, artist: e.target.value }))
                      }
                      placeholder="Artist name (optional)"
                    />
                  </div>

                  {/* Duplicate ISRC warning */}
                  {isDuplicateIsrc && (
                    <div className="p-3 rounded-lg border bg-destructive/10 border-destructive/50">
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <AlertCircle className="w-4 h-4" />
                        A track with this ISRC already exists in this account.
                      </div>
                    </div>
                  )}

                  {/* Error message */}
                  {trackError && (
                    <div className="p-3 rounded-lg border bg-destructive/10 border-destructive/50">
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <AlertCircle className="w-4 h-4" />
                        {trackError}
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowNewTrackDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddNewTrack}
                    disabled={
                      !newTrackData.title.trim() ||
                      !newTrackData.isrc.trim() ||
                      creatingTrack ||
                      isDuplicateIsrc
                    }
                  >
                    {creatingTrack ? 'Adding...' : 'Add Track'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search results */}
          {trackSearch && (
            <div className="border rounded-lg max-h-48 overflow-y-auto">
              {loadingTracks ? (
                <div className="p-4 text-center text-muted-foreground">Loading...</div>
              ) : filteredTracks.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No tracks found.{' '}
                  <button
                    className="text-primary hover:underline"
                    onClick={() => {
                      setNewTrackData((prev) => ({ ...prev, title: trackSearch }));
                      setShowNewTrackDialog(true);
                    }}
                  >
                    Create new track
                  </button>
                </div>
              ) : (
                <ul className="divide-y">
                  {filteredTracks.map((track) => (
                    <li key={track.id}>
                      <button
                        className="w-full text-left p-3 hover:bg-muted/50 transition-colors flex items-center justify-between"
                        onClick={() => addTrack(track)}
                      >
                        <div>
                          <p className="font-medium">{track.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {track.isrc && <span>ISRC: {track.isrc} • </span>}
                            {track.artist && <span>{track.artist}</span>}
                          </p>
                        </div>
                        <Plus className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Linked Tracks */}
      {linkedTracks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Linked Recordings ({linkedTracks.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {linkedTracks.map((track) => (
              <div
                key={track.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Radio className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">{track.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {track.isrc && <span>ISRC: {track.isrc}</span>}
                      {track.artist && <span> • {track.artist}</span>}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTrack(track.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {linkedTracks.length === 0 && !trackSearch && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Radio className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No recordings linked yet</h3>
            <p className="text-muted-foreground mb-4">
              Search for existing tracks above to link them to this work, or skip this step.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={onNext}>
          Next: Details
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
