import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import {
    announcementClientService,
} from "@/services/announcement-client.service";

export function useAnnouncement() {

    return useQuery({

        queryKey: ["announcement"],

        queryFn: () =>
            announcementClientService.get(),

    });

}

export function useDeleteAnnouncement() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => announcementClientService.remove(id),
        onSuccess() {
            return queryClient.invalidateQueries({ queryKey: ["announcement"] });
        },
    });
}

export function useUpdateAnnouncement() {

    const queryClient =
        useQueryClient();

    return useMutation({

        mutationFn:
            announcementClientService.update,

        onSuccess() {
            void queryClient.invalidateQueries({ queryKey: ["notifications"] });

            queryClient.invalidateQueries({

                queryKey: ["announcement"],

            });

        },

    });

}
