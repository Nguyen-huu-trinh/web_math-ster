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

export function useUpdateAnnouncement() {

    const queryClient =
        useQueryClient();

    return useMutation({

        mutationFn:
            announcementClientService.update,

        onSuccess() {

            queryClient.invalidateQueries({

                queryKey: ["announcement"],

            });

        },

    });

}