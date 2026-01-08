"use client";

import { useEffect } from "react";
import {
  supportService,
  Ticket,
  TicketReply,
  CreateTicketDto,
  UpdateTicketDto,
  CreateReplyDto,
  RateTicketDto,
  TicketsResponse,
  TicketStats,
  TicketStatus,
  TicketCategory,
  TicketPriority
} from "@/services/support.service";
import { useToast } from "@/context/ToastContext";
import { useSupportTicketsStore } from "@/store/supportTicketsStore";

export function useSupport() {
  const { push } = useToast();
  const {
    tickets,
    stats,
    pagination,
    isLoading,
    isStatsLoading,
    isActionLoading,
    error,
    filters,
    setTickets,
    setStats,
    setPagination,
    addTicket,
    updateTicket: updateTicketInStore,
    removeTicket,
    addReply: addReplyToStore,
    setLoading,
    setStatsLoading,
    setActionLoading,
    setError,
    clearErrors,
    setFilters,
  } = useSupportTicketsStore();

  // Fetch tickets with filters
  const fetchTickets = async (params: {
    page?: number;
    limit?: number;
    status?: TicketStatus;
    category?: TicketCategory;
    priority?: TicketPriority;
    assignedTo?: string;
    userId?: string;
  } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await supportService.getTickets(params) as TicketsResponse;
      setTickets(data.tickets);
      setPagination(data.pagination);
      setFilters(params);
      return data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch tickets";
      setError(errorMessage);
      push({
        type: "error",
        message: errorMessage,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fetch my tickets
  const fetchMyTickets = async (params: {
    page?: number;
    limit?: number;
  } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await supportService.getMyTickets(params) as TicketsResponse;
      setTickets(data.tickets);
      setPagination(data.pagination);
      return data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch my tickets";
      setError(errorMessage);
      push({
        type: "error",
        message: errorMessage,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fetch ticket by ID
  const fetchTicketById = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await supportService.getTicketById(id);
      // Update ticket in store if it exists
      updateTicketInStore(id, { ...data.ticket, replies: data.replies });
      return data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch ticket";
      setError(errorMessage);
      push({
        type: "error",
        message: errorMessage,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const data = await supportService.getStats() as TicketStats;
      setStats(data);
      return data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch stats";
      push({
        type: "error",
        message: errorMessage,
      });
      throw error;
    } finally {
      setStatsLoading(false);
    }
  };

  // Create ticket
  const createTicket = async (ticketData: CreateTicketDto) => {
    setActionLoading(true);
    try {
      const newTicket = await supportService.createTicket(ticketData) as Ticket;
      addTicket(newTicket);
      push({
        type: "success",
        message: "Ticket created successfully",
      });
      return newTicket;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to create ticket";
      push({
        type: "error",
        message: errorMessage,
      });
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  // Update ticket
  const updateTicket = async (id: string, ticketData: UpdateTicketDto) => {
    setActionLoading(true);
    try {
      const updatedTicket = await supportService.updateTicket(id, ticketData) as Ticket;
      updateTicketInStore(id, updatedTicket);
      push({
        type: "success",
        message: "Ticket updated successfully",
      });
      return updatedTicket;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to update ticket";
      push({
        type: "error",
        message: errorMessage,
      });
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  // Delete ticket
  const deleteTicket = async (id: string) => {
    setActionLoading(true);
    try {
      await supportService.deleteTicket(id);
      removeTicket(id);
      push({
        type: "success",
        message: "Ticket deleted successfully",
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to delete ticket";
      push({
        type: "error",
        message: errorMessage,
      });
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  // Add reply to ticket
  const addReply = async (ticketId: string, replyData: CreateReplyDto) => {
    setActionLoading(true);
    try {
      const reply = await supportService.addReply(ticketId, replyData) as TicketReply;
      addReplyToStore(ticketId, reply);
      push({
        type: "success",
        message: "Reply added successfully",
      });
      return reply;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to add reply";
      push({
        type: "error",
        message: errorMessage,
      });
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  // Rate ticket
  const rateTicket = async (id: string, ratingData: RateTicketDto) => {
    setActionLoading(true);
    try {
      const updatedTicket = await supportService.rateTicket(id, ratingData) as Ticket;
      updateTicketInStore(id, updatedTicket);
      push({
        type: "success",
        message: "Ticket rated successfully",
      });
      return updatedTicket;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to rate ticket";
      push({
        type: "error",
        message: errorMessage,
      });
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  // Assign ticket
  const assignTicket = async (ticketId: string, userId: string) => {
    setActionLoading(true);
    try {
      const updatedTicket = await supportService.assignTicket(ticketId, userId) as Ticket;
      updateTicketInStore(ticketId, updatedTicket);
      push({
        type: "success",
        message: "Ticket assigned successfully",
      });
      return updatedTicket;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to assign ticket";
      push({
        type: "error",
        message: errorMessage,
      });
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  // Close ticket
  const closeTicket = async (id: string) => {
    setActionLoading(true);
    try {
      const updatedTicket = await supportService.closeTicket(id) as Ticket;
      updateTicketInStore(id, updatedTicket);
      push({
        type: "success",
        message: "Ticket closed successfully",
      });
      return updatedTicket;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to close ticket";
      push({
        type: "error",
        message: errorMessage,
      });
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  return {
    // Data
    tickets,
    stats,
    pagination,
    filters,

    // Loading states
    isLoading,
    isStatsLoading,
    isActionLoading,

    // Error states
    error,

    // Actions
    fetchTickets,
    fetchMyTickets,
    fetchTicketById,
    fetchStats,
    createTicket,
    updateTicket,
    deleteTicket,
    addReply,
    rateTicket,
    assignTicket,
    closeTicket,
    clearErrors,
    setFilters,
  };
}
